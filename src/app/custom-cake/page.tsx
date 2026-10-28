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

  // Styles & Flavors Options (Indian Bakery Specials)
  const cakeStyles = [
    { id: 'Buttercream Floral', name: 'Buttercream Floral & Textured (Eggless)', desc: 'Silky smooth whipped buttercream with piped roses and edible golden pearls.', basePrice: 850 },
    { id: 'Semi-Naked Rustic', name: 'Semi-Naked Saffron & Dry Fruit', desc: 'Exposed crumb sponge layered with saffron rabdi, slivered pistachios & rose petals.', basePrice: 750 },
    { id: 'Sculpted Fondant', name: 'Sculpted 3D Theme & Fondant', desc: 'Custom cartoon, half-birthday, engagement ring box, or traditional peacock theme.', basePrice: 1200 },
    { id: 'Vintage Lambeth', name: 'Vintage Lambeth Heart (Eggless)', desc: 'Victorian ornate frills, heart-shaped silhouette & celebratory satin ribbon.', basePrice: 950 },
  ];

  const spongeOptions = [
    'Belgian Dark Chocolate Truffle (100% Eggless)',
    'Royal Rasmalai Infused Sponge (100% Eggless)',
    'Kesar Pista Saffron Sponge (100% Eggless)',
    'Classic Red Velvet Sponge',
    'Gulab Jamun Cardamom Chiffon (100% Eggless)',
  ];

  const fillingOptions = [
    'Dark Belgian Chocolate Ganache',
    'Saffron Rabdi & Rasmalai Compote',
    'Pistachio Praline Crunch',
    'Whipped Vanilla Buttercream',
    'Philadelphia Cream Cheese',
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

      // Trigger Confetti Celebration (Milk Bar Hot Pink, Yellow & Mint)
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E4007C', '#FFE600', '#00E5A3', '#111111'],
      });
    } catch (err) {
      console.error(err);
      alert('Error submitting inquiry. Please try again or WhatsApp us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-white">
      <div className="container-custom max-w-4xl">
        {/* Milk Bar Style Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE600] text-[#111111] border border-[#111111] text-[10px] font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_#111111]">
            <Sparkles className="w-3.5 h-3.5 text-[#E4007C]" />
            CUSTOM CAKE LAB &amp; BESPOKE DESSERT STUDIO
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">
            DESIGN YOUR DREAM CAKE
          </h1>
          <p className="text-xs md:text-sm text-[#6B7280] font-medium mt-3 max-w-xl mx-auto">
            From intimate birthday celebrations to showstopper multi-tier party centerpieces, our pastry chefs bring your sweetest vision to life.
          </p>
        </div>

        {/* Success Screen */}
        {submittedRequestNumber ? (
          <div className="bg-[#FFF0F6] rounded-2xl p-8 md:p-12 border-2 border-[#111111] text-center shadow-[6px_6px_0px_#111111]">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] border-2 border-[#15803D] text-[#15803D] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#111111]">
              INQUIRY RECEIVED! (#{submittedRequestNumber})
            </h2>
            <p className="text-xs md:text-sm text-[#6B7280] font-semibold mt-2 max-w-md mx-auto">
              We have recorded your custom cake preferences for{' '}
              <strong className="text-[#111111]">{eventDate}</strong>.
            </p>

            <div className="mt-8 p-5 rounded-xl bg-white border-2 border-[#111111] text-left max-w-md mx-auto text-xs space-y-2 shadow-[3px_3px_0px_#111111]">
              <p><strong>Style:</strong> {cakeType}</p>
              <p><strong>Flavor:</strong> {spongeFlavor} &amp; {fillingFlavor}</p>
              <p><strong>Tiers &amp; Weight:</strong> {tierCount} Tier ({estimatedWeightKg} kg)</p>
              {messageOnCake && <p><strong>Piped Text:</strong> &ldquo;{messageOnCake}&rdquo;</p>}
              <p className="text-[#E4007C] font-bold"><strong>Estimated Range:</strong> ~₹{Math.round(estimatedPrice)} (Finalized on WhatsApp based on design)</p>
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
          /* Multi-Step Studio with Milk Bar Aesthetics */
          <div className="bg-white rounded-2xl border-2 border-[#111111] shadow-[6px_6px_0px_#111111] overflow-hidden">
            {/* Step Indicators */}
            <div className="grid grid-cols-3 border-b-2 border-[#111111] bg-[#FAFAFA] text-center text-xs font-black uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-4 px-2 transition-all ${
                  currentStep === 1
                    ? 'bg-[#E4007C] text-white'
                    : 'text-[#111111] hover:bg-[#FFF0F6]'
                }`}
              >
                1. Style &amp; Flavors
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-4 px-2 transition-all border-x-2 border-[#111111] ${
                  currentStep === 2
                    ? 'bg-[#E4007C] text-white'
                    : 'text-[#111111] hover:bg-[#FFF0F6]'
                }`}
              >
                2. Tiers &amp; Design
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`py-4 px-2 transition-all ${
                  currentStep === 3
                    ? 'bg-[#E4007C] text-white'
                    : 'text-[#111111] hover:bg-[#FFF0F6]'
                }`}
              >
                3. Date &amp; Details
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {/* STEP 1: STYLE & FLAVORS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#111111] mb-1">
                      Choose Your Cake Style
                    </h3>
                    <p className="text-xs text-[#6B7280] font-medium mb-4">
                      Select the artistic look that matches your event aesthetic.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cakeStyles.map((style) => (
                        <div
                          key={style.id}
                          onClick={() => setCakeType(style.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            cakeType === style.id
                              ? 'border-[#E4007C] bg-[#FFF0F6] shadow-[3px_3px_0px_#E4007C]'
                              : 'border-[#111111] hover:border-[#E4007C] bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase text-[#111111]">{style.name}</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFE600] text-[#111111] border border-[#111111]">
                              From ₹{style.basePrice}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B7280] font-medium mt-1.5 leading-relaxed">
                            {style.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sponge & Filling Flavors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#111111]/10">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-2">
                        Sponge Flavour
                      </label>
                      <select
                        value={spongeFlavor}
                        onChange={(e) => setSpongeFlavor(e.target.value)}
                        className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] text-[#111111] focus:outline-none focus:border-[#E4007C]"
                      >
                        {spongeOptions.map((flavor) => (
                          <option key={flavor} value={flavor}>
                            {flavor}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-2">
                        Filling &amp; Frosting
                      </label>
                      <select
                        value={fillingFlavor}
                        onChange={(e) => setFillingFlavor(e.target.value)}
                        className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] text-[#111111] focus:outline-none focus:border-[#E4007C]"
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
                      Next: Tiers &amp; Visualizer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TIERS & DESIGN VISUALIZER */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#111111] mb-1">
                      Cake Size &amp; Tiers
                    </h3>
                    <p className="text-xs text-[#6B7280] font-medium mb-4">
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
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            tierCount === t.tiers
                              ? 'border-[#E4007C] bg-[#FFF0F6] shadow-[3px_3px_0px_#E4007C]'
                              : 'border-[#111111] bg-white hover:bg-[#F4F4F4]'
                          }`}
                        >
                          <Cake className="w-6 h-6 mx-auto mb-1 text-[#E4007C]" />
                          <p className="font-black text-xs uppercase text-[#111111]">{t.label}</p>
                          <p className="text-[10px] text-[#E4007C] font-black uppercase mt-0.5">{t.serves}</p>
                          <p className="text-[10px] text-[#6B7280] font-bold">Approx. {t.weight} kg</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reference Image Upload */}
                  <div className="pt-4 border-t border-[#111111]/10">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-2">
                      Upload Reference Design or Photo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-[#111111] hover:border-[#E4007C] rounded-2xl p-6 text-center bg-[#FFF0F6]/40 cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {previewUrl ? (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 relative rounded-xl overflow-hidden mb-2 border-2 border-[#111111]">
                            <Image
                              src={previewUrl}
                              alt="Cake reference preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-xs font-black uppercase text-[#15803D]">
                            Photo selected! Click to replace.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-[#E4007C] mb-2" />
                          <p className="text-xs font-black uppercase text-[#111111]">
                            Click or drag cake reference image here
                          </p>
                          <p className="text-[10px] text-[#6B7280] font-bold mt-1">PNG, JPG, WEBP up to 8MB</p>
                        </div>
                      )}
                    </div>
                    {uploadError && <p className="text-xs text-[#E4007C] font-bold mt-1">{uploadError}</p>}
                  </div>

                  {/* Inscription & Live Board Preview */}
                  <div className="pt-4 border-t border-[#111111]/10">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-2">
                      Cake Board Inscription Message
                    </label>
                    <input
                      type="text"
                      maxLength={40}
                      placeholder="e.g. Happy 30th Birthday Sophia! 🌸"
                      value={messageOnCake}
                      onChange={(e) => setMessageOnCake(e.target.value)}
                      className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                    />

                    {messageOnCake && (
                      <div className="mt-3 p-3 rounded-xl bg-[#111111] text-[#FFE600] text-center font-black uppercase tracking-wider text-xs border-2 border-[#E4007C] shadow-[3px_3px_0px_#E4007C]">
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
                      Next: Schedule &amp; Contact
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SCHEDULE & CONTACT */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#111111] mb-1">
                      Event Schedule &amp; Delivery
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-[#111111] bg-[#FFE600] border-2 border-[#111111] p-3 rounded-xl mb-4 shadow-[2px_2px_0px_#111111]">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#E4007C]" />
                      <span>Custom designs require a minimum of 48 hours for delicate handcrafted details.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-2">
                          Event Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            min={minDateString}
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full text-xs font-bold p-3 pl-10 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                            required
                          />
                          <Calendar className="w-4 h-4 text-[#111111] absolute left-3 top-3.5 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-2">
                          Preferred Time Window
                        </label>
                        <div className="relative">
                          <select
                            value={deliverySlot}
                            onChange={(e) => setDeliverySlot(e.target.value)}
                            className="w-full text-xs font-bold p-3 pl-10 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                          >
                            <option value="10:00 - 13:00 (Morning)">10:00 AM - 1:00 PM (Morning)</option>
                            <option value="14:00 - 18:00 (Evening)">2:00 PM - 6:00 PM (Evening)</option>
                            <option value="18:00 - 21:00 (Night Event)">6:00 PM - 9:00 PM (Night Event)</option>
                          </select>
                          <Clock className="w-4 h-4 text-[#111111] absolute left-3 top-3.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="pt-4 border-t border-[#111111]/10">
                    <h3 className="text-base font-black uppercase tracking-tight text-[#111111] mb-3">
                      Your Contact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Sarah Jenkins"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                          WhatsApp Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                        Special Requests or Dietary Allergies
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. 100% Nut-free, pastel pink roses, include gold foil accents..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="w-full text-xs font-medium p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                      />
                    </div>
                  </div>

                  {/* Estimated Quote Box */}
                  <div className="p-5 rounded-xl bg-[#FFF0F6] border-2 border-[#111111] flex items-center justify-between shadow-[4px_4px_0px_#111111]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#E4007C] block">
                        ESTIMATED PRICE GUIDE
                      </span>
                      <p className="text-3xl font-black text-[#111111]">
                        ~₹{Math.round(estimatedPrice)}
                      </p>
                      <span className="text-[10px] text-[#6B7280] font-bold">
                        *Final quote confirmed via WhatsApp based on exact floral/fondant detailing.
                      </span>
                    </div>

                    <Cake className="w-10 h-10 text-[#E4007C]" />
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
                      className="btn-gold !py-3.5 !px-8 text-xs font-black"
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
