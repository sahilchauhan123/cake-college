'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Cake, Sparkles, Upload, Calendar, Clock, CheckCircle2, MessageCircle, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabase';
import { formatCustomCakeWhatsAppMessage, getWhatsAppUrl } from '../../lib/whatsapp';

export default function CustomCakePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  // Form State
  const [cakeType, setCakeType] = useState('Buttercream Floral');
  const [spongeFlavor, setSpongeFlavor] = useState('Belgian Chocolate Truffle');
  const [fillingFlavor, setFillingFlavor] = useState('Dark Chocolate Ganache');
  const [tierCount, setTierCount] = useState<1 | 2 | 3>(1);
  const [estimatedWeightKg, setEstimatedWeightKg] = useState(1.5);
  const [messageOnCake, setMessageOnCake] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Date selection (minimum 2 days ahead)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split('T')[0];
  
  const [eventDate, setEventDate] = useState(minDateString);
  const [deliverySlot, setDeliverySlot] = useState('14:00 - 18:00 (Evening)');

  // Contact info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Image upload
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Styles & Flavors Options
  const cakeStyles = [
    { id: 'Buttercream Floral', name: 'Buttercream Floral & Textured', desc: 'Silk Swiss meringue buttercream piped with delicate botanical florals.', basePrice: 45 },
    { id: 'Semi-Naked Rustic', name: 'Semi-Naked Rustic Berry', desc: 'Lightly scraped sponge with exposed crumb, fresh berries & rosemary sprigs.', basePrice: 40 },
    { id: 'Sculpted Fondant', name: 'Sculpted Fondant & Theme', desc: 'Hand-sculpted bespoke 3D toppers, figurines, or crisp geometric fondant.', basePrice: 55 },
    { id: 'Vintage Lambeth', name: 'Vintage Lambeth Heart', desc: 'Classic ornate Victorian over-piping, ruffled borders & satin ribbon aesthetics.', basePrice: 50 },
  ];

  const spongeOptions = [
    'Belgian Chocolate Truffle',
    'Madagascar Vanilla Bean',
    'Velvety Red Velvet',
    'Zesty Lemon & Poppyseed',
    'Almond & Raspberry',
  ];

  const fillingOptions = [
    'Dark Chocolate Ganache',
    'Whipped Vanilla Buttercream',
    'Cream Cheese Frosting',
    'Salted Caramel & Roasted Pecans',
    'Fresh Berry Compote',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setUploadError('Image size must be under 8MB');
        return;
      }
      setReferenceFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  const handleTierChange = (tiers: 1 | 2 | 3) => {
    setTierCount(tiers);
    if (tiers === 1) setEstimatedWeightKg(1.5);
    else if (tiers === 2) setEstimatedWeightKg(2.5);
    else if (tiers === 3) setEstimatedWeightKg(4.0);
  };

  // Base price calculation estimate
  const selectedStyleObj = cakeStyles.find((s) => s.id === cakeType) || cakeStyles[0];
  const estimatedPrice = selectedStyleObj.basePrice * tierCount * (estimatedWeightKg / 1.2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please provide your name and WhatsApp phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrl: string | undefined = undefined;

      // Upload image to Supabase Storage if provided
      if (referenceFile) {
        const fileExt = referenceFile.name.split('.').pop();
        const fileName = `cake-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: storageError } = await supabase.storage
          .from('cake-references')
          .upload(fileName, referenceFile);

        if (!storageError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('cake-references')
            .getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
      }

      const requestNumber = `CAKE-${Date.now().toString().slice(-6)}`;

      // Save to Supabase database
      const { error: dbError } = await (supabase.from('custom_cake_requests') as any).insert({
        request_number: requestNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        cake_type: cakeType,
        sponge_flavor: spongeFlavor,
        filling_flavor: fillingFlavor,
        tier_count: tierCount,
        estimated_weight_kg: estimatedWeightKg,
        reference_image_urls: uploadedImageUrl ? [uploadedImageUrl] : [],
        message_on_cake: messageOnCake.trim() || null,
        event_date: eventDate,
        delivery_slot: deliverySlot,
        special_instructions: specialInstructions.trim() || null,
        quoted_price: Math.round(estimatedPrice),
        status: 'PENDING',
      });

      if (dbError) {
        console.warn('Database note:', dbError.message);
      }

      // Generate WhatsApp link
      const waMsg = formatCustomCakeWhatsAppMessage({
        requestNumber,
        customerName,
        customerPhone,
        cakeType,
        spongeFlavor,
        fillingFlavor,
        tierCount,
        estimatedWeightKg,
        messageOnCake: messageOnCake.trim(),
        eventDate,
        deliverySlot,
        referenceImageUrl: uploadedImageUrl,
        specialInstructions: specialInstructions.trim(),
      });

      const waUrl = getWhatsAppUrl(waMsg);
      setWhatsappLink(waUrl);
      setSubmittedRequestNumber(requestNumber);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B4513', '#D97706', '#F59E0B', '#DCFCE7'],
      });
    } catch (err) {
      console.error(err);
      alert('Error submitting inquiry. Please try again or WhatsApp us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 bg-[#FDFBF7]">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Custom Cake Studio
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[#231815] tracking-tight">
            Design Your Dream Cake
          </h1>
          <p className="text-sm md:text-base text-[#7E6C65] mt-3 max-w-xl mx-auto">
            From intimate birthday celebrations to showstopper wedding tiers, our master pastry chefs bring your creative vision to life.
          </p>
        </div>

        {/* Success Screen */}
        {submittedRequestNumber ? (
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E8DDD2] text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#231815]">
              Inquiry Received! (#{submittedRequestNumber})
            </h2>
            <p className="text-sm text-[#7E6C65] mt-2 max-w-md mx-auto">
              We have recorded your custom cake preferences for{' '}
              <strong className="text-[#231815]">{eventDate}</strong>.
            </p>

            <div className="mt-8 p-5 rounded-2xl bg-[#FAF4EB] border border-[#E8DDD2] text-left max-w-md mx-auto text-xs space-y-2">
              <p><strong>Style:</strong> {cakeType}</p>
              <p><strong>Flavor:</strong> {spongeFlavor} & {fillingFlavor}</p>
              <p><strong>Tiers & Weight:</strong> {tierCount} Tier ({estimatedWeightKg} kg)</p>
              {messageOnCake && <p><strong>Piped Text:</strong> &ldquo;{messageOnCake}&rdquo;</p>}
              <p><strong>Estimated Range:</strong> ~${Math.round(estimatedPrice)} (Subject to design complexity)</p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp w-full sm:w-auto"
                >
                  <MessageCircle className="w-4 h-4" />
                  Confirm Design via WhatsApp
                </a>
              )}
              <Link href="/catalogue" className="btn-secondary w-full sm:w-auto">
                Return to Menu
              </Link>
            </div>
          </div>
        ) : (
          /* Multi-Step Studio */
          <div className="bg-white rounded-3xl border border-[#E8DDD2] shadow-sm overflow-hidden">
            {/* Step Indicators */}
            <div className="grid grid-cols-3 border-b border-[#E8DDD2] bg-[#FAF4EB] text-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-4 px-2 transition-colors ${
                  currentStep === 1
                    ? 'bg-white text-[#8B4513] border-b-2 border-[#8B4513]'
                    : 'text-[#7E6C65]'
                }`}
              >
                1. Style & Flavors
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-4 px-2 transition-colors ${
                  currentStep === 2
                    ? 'bg-white text-[#8B4513] border-b-2 border-[#8B4513]'
                    : 'text-[#7E6C65]'
                }`}
              >
                2. Tiers & Design
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`py-4 px-2 transition-colors ${
                  currentStep === 3
                    ? 'bg-white text-[#8B4513] border-b-2 border-[#8B4513]'
                    : 'text-[#7E6C65]'
                }`}
              >
                3. Date & Details
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {/* STEP 1: STYLE & FLAVORS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#231815] mb-1">
                      Choose Your Cake Style
                    </h3>
                    <p className="text-xs text-[#7E6C65] mb-4">
                      Select the artistic look that matches your event aesthetic.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cakeStyles.map((style) => (
                        <div
                          key={style.id}
                          onClick={() => setCakeType(style.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            cakeType === style.id
                              ? 'border-[#8B4513] bg-[#F7EFE8] shadow-sm ring-1 ring-[#8B4513]'
                              : 'border-[#E8DDD2] hover:border-[#8B4513]/50 bg-[#FDFBF7]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[#231815]">{style.name}</span>
                            <span className="text-xs font-semibold text-[#8B4513]">From ${style.basePrice}</span>
                          </div>
                          <p className="text-xs text-[#7E6C65] mt-1 leading-relaxed">
                            {style.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sponge & Filling Flavors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#F2EBE3]">
                    <div>
                      <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-2">
                        Sponge Flavour
                      </label>
                      <select
                        value={spongeFlavor}
                        onChange={(e) => setSpongeFlavor(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] text-[#231815] focus:outline-none focus:border-[#8B4513]"
                      >
                        {spongeOptions.map((flavor) => (
                          <option key={flavor} value={flavor}>
                            {flavor}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-2">
                        Filling & Frosting
                      </label>
                      <select
                        value={fillingFlavor}
                        onChange={(e) => setFillingFlavor(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] text-[#231815] focus:outline-none focus:border-[#8B4513]"
                      >
                        {fillingOptions.map((filling) => (
                          <option key={filling} value={filling}>
                            {filling}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="btn-primary"
                    >
                      Next: Tiers & Visualizer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TIERS & DESIGN VISUALIZER */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#231815] mb-1">
                      Cake Size & Tiers
                    </h3>
                    <p className="text-xs text-[#7E6C65] mb-4">
                      Choose the number of tiers based on your anticipated guest count.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { tiers: 1, label: 'Single Tier', weight: 1.5, serves: '8-12 Guests' },
                        { tiers: 2, label: 'Two Tiers', weight: 2.5, serves: '18-24 Guests' },
                        { tiers: 3, label: 'Three Tiers', weight: 4.0, serves: '35-45 Guests' },
                      ].map((t) => (
                        <button
                          key={t.tiers}
                          type="button"
                          onClick={() => handleTierChange(t.tiers as 1 | 2 | 3)}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            tierCount === t.tiers
                              ? 'border-[#8B4513] bg-[#F7EFE8] ring-1 ring-[#8B4513]'
                              : 'border-[#E8DDD2] bg-[#FDFBF7]'
                          }`}
                        >
                          <Cake className="w-6 h-6 mx-auto mb-1 text-[#8B4513]" />
                          <p className="font-bold text-sm text-[#231815]">{t.label}</p>
                          <p className="text-[11px] text-[#B45309] font-semibold mt-0.5">{t.serves}</p>
                          <p className="text-[10px] text-[#7E6C65]">Approx. {t.weight} kg</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reference Image Upload */}
                  <div className="pt-4 border-t border-[#F2EBE3]">
                    <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-2">
                      Upload Reference Design or Photo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-[#E8DDD2] hover:border-[#8B4513] rounded-2xl p-6 text-center bg-[#FDFBF7] cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {previewUrl ? (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 relative rounded-xl overflow-hidden mb-2 border border-[#E8DDD2]">
                            <Image
                              src={previewUrl}
                              alt="Cake reference preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-xs font-semibold text-[#15803D]">
                            Photo selected! Click to replace.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-[#A8988D] mb-2" />
                          <p className="text-xs font-semibold text-[#231815]">
                            Click or drag cake reference image here
                          </p>
                          <p className="text-[10px] text-[#A8988D] mt-1">PNG, JPG, WEBP up to 8MB</p>
                        </div>
                      )}
                    </div>
                    {uploadError && <p className="text-xs text-[#BE123C] mt-1">{uploadError}</p>}
                  </div>

                  {/* Inscription & Live Board Preview */}
                  <div className="pt-4 border-t border-[#F2EBE3]">
                    <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-2">
                      Cake Board Inscription Message
                    </label>
                    <input
                      type="text"
                      maxLength={40}
                      placeholder="e.g. Happy 30th Birthday Sophia! 🌸"
                      value={messageOnCake}
                      onChange={(e) => setMessageOnCake(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                    />

                    {messageOnCake && (
                      <div className="mt-3 p-3 rounded-xl bg-[#231815] text-[#FAF4EB] text-center font-serif italic text-sm tracking-wide shadow-inner">
                        &ldquo;{messageOnCake}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="btn-primary"
                    >
                      Next: Schedule & Contact
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SCHEDULE & CONTACT */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#231815] mb-1">
                      Event Schedule & Delivery
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#B45309] bg-[#FEF3C7] p-2.5 rounded-xl mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Custom designs require a minimum of 48 hours for delicate handcrafted details.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-2">
                          Event Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            min={minDateString}
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full text-sm p-3 pl-10 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                            required
                          />
                          <Calendar className="w-4 h-4 text-[#7E6C65] absolute left-3 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-2">
                          Preferred Time Window
                        </label>
                        <div className="relative">
                          <select
                            value={deliverySlot}
                            onChange={(e) => setDeliverySlot(e.target.value)}
                            className="w-full text-sm p-3 pl-10 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                          >
                            <option value="10:00 - 13:00 (Morning)">10:00 AM - 1:00 PM (Morning)</option>
                            <option value="14:00 - 18:00 (Evening)">2:00 PM - 6:00 PM (Evening)</option>
                            <option value="18:00 - 21:00 (Night Event)">6:00 PM - 9:00 PM (Night Event)</option>
                          </select>
                          <Clock className="w-4 h-4 text-[#7E6C65] absolute left-3 top-3.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="pt-4 border-t border-[#F2EBE3]">
                    <h3 className="font-serif text-lg font-bold text-[#231815] mb-3">
                      Your Contact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Sarah Jenkins"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                          WhatsApp Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+1 555 123 4567"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                        Special Requests or Dietary Allergies
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. 100% Nut-free, pastel pink roses, include gold foil accents..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                  </div>

                  {/* Estimated Quote Box */}
                  <div className="p-4 rounded-2xl bg-[#F7EFE8] border border-[#E8DDD2] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E6C65]">
                        Estimated Price Guide
                      </span>
                      <p className="text-2xl font-serif font-extrabold text-[#231815]">
                        ~${Math.round(estimatedPrice)}
                      </p>
                      <span className="text-[10px] text-[#A8988D]">
                        *Final quote confirmed via WhatsApp based on exact floral/fondant detailing.
                      </span>
                    </div>

                    <Cake className="w-10 h-10 text-[#8B4513]/40" />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold !py-3.5 !px-8 text-sm"
                    >
                      {isSubmitting ? 'Submitting Design...' : 'Submit & Connect with Baker ✨'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
