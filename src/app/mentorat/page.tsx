'use client';
import React, { useState, useEffect } from 'react';
import {
  Star, Users, Trophy, Target, Rocket, Heart, MessageCircle, Award, Zap, Calendar,
  CheckCircle, ArrowRight, Sparkles, Clock, Gift, Shield, BookOpen, Globe, TrendingUp,
  Briefcase, CreditCard, Lock, AlertCircle, Loader, Check, X, ChevronRight
} from 'lucide-react';

// --- Stripe ---
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Utilise ta clé publique Stripe ici (commence par pk_test_ ou pk_live_)
const STRIPE_PUBLIC_KEY: string = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_12345';
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// Composant pour gérer le formulaire de paiement Stripe
interface CheckoutPaymentFormProps {
  onBack: () => void;
  onSuccess: () => void;
  setError: (error: string) => void;
  checkoutData: {
    email: string;
    nom: string;
    prenom: string;
    telephone: string;
    acceptTerms: boolean;
    email_autorise: boolean;
  };
}

function CheckoutPaymentForm({ onBack, onSuccess, setError, checkoutData }: CheckoutPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    try {
      // Validation du formulaire Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Veuillez vérifier vos informations de paiement");
        setProcessing(false);
        return;
      }

      // Confirmation du paiement avec gestion du redirect
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          receipt_email: checkoutData.email,
        },
        redirect: 'if_required'
      });

      // Si on arrive ici, c'est que le paiement n'a pas nécessité de redirection
      if (result.error) {
        // Gestion des erreurs
        console.error('Erreur de paiement:', result.error);

        if (result.error.type === 'card_error' || result.error.type === 'validation_error') {
          setError(result.error.message || "Erreur de carte bancaire");
        } else {
          setError(result.error.message || "Une erreur est survenue lors du paiement");
        }
        setProcessing(false);
      } else if (result.paymentIntent) {
        // Paiement réussi sans redirection
        console.log('Paiement réussi:', result.paymentIntent.status);

        if (result.paymentIntent.status === 'succeeded') {
          setProcessing(false);
          onSuccess();
        } else if (result.paymentIntent.status === 'processing') {
          // Paiement en cours de traitement
          setError("Paiement en cours de validation. Vous recevrez une confirmation par email dans quelques instants.");
          setTimeout(() => {
            setProcessing(false);
            onSuccess();
          }, 2000);
        } else if (result.paymentIntent.status === 'requires_action' ||
          result.paymentIntent.status === 'requires_confirmation') {
          // Le paiement nécessite une action supplémentaire
          setError("Action supplémentaire requise pour finaliser le paiement");
          setProcessing(false);
        } else {
          // Statut inattendu
          console.error('Statut inattendu:', result.paymentIntent.status);
          setError("Le paiement n'a pas pu être confirmé. Veuillez réessayer.");
          setProcessing(false);
        }
      } else {
        // Cas où ni error ni paymentIntent (ne devrait pas arriver)
        console.error('Résultat inattendu:', result);
        setProcessing(false);
        onSuccess(); // On considère que c'est un succès si pas d'erreur
      }
    } catch (err) {
      // Erreur inattendue
      console.error('Erreur inattendue:', err);
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setProcessing(false);
    }
  };

  return (
    <>
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: {
            billingDetails: {
              email: 'auto', // On a déjà l'email
              name: 'auto',  // On a déjà le nom
            }
          }
        }}
      />

      <div className="space-y-3 mt-6">
        <button
          onClick={handlePay}
          disabled={processing || !stripe || !elements}
          className={`w-full py-4 rounded-full font-bold text-white transition-all ${processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#F22E77] to-[#7978E2] hover:shadow-xl transform hover:scale-105'
            }`}
        >
          {processing ? (
            <span className="flex items-center justify-center">
              <Loader className="animate-spin mr-2 w-5 h-5" />
              Traitement en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <CreditCard className="mr-2 w-5 h-5" />
              Confirmer le paiement
            </span>
          )}
        </button>

        <button
          onClick={onBack}
          disabled={processing}
          className="w-full py-3 rounded-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Retour
        </button>
      </div>
    </>
  );
}

// Composant principal
export default function FutureLeaderSalesPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModule, setActiveModule] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 32 });
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: info, 2: payment, 3: success
  const [loading, setLoading] = useState(false);

  // Informations du produit
  const productInfo = {
    id: 'future-leader-2025',
    name: 'Mentorat Future Leader',
    price: 1997,
    bonuses: [
      { name: 'Audit Instagram', value: 197 },
      { name: 'Bio Optimisée', value: 147 },
      { name: '3 Ateliers Lives', value: 297 }
    ]
  };

  // État du formulaire
  const [checkoutData, setCheckoutData] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    acceptTerms: false,
    email_autorise: false
  });

  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Configuration de l'API URL (à adapter selon ton environnement)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59 };
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const modules = [
    { icon: Rocket, title: "Leadership & Vision", desc: "Développe ta vision stratégique et ton style de leadership unique" },
    { icon: Users, title: "Communication d'Impact", desc: "Maîtrise l'art de communiquer avec influence et authenticité" },
    { icon: Target, title: "Stratégie & Décision", desc: "Prends des décisions éclairées et développe une pensée stratégique" },
    { icon: Heart, title: "Intelligence Émotionnelle", desc: "Gère tes émotions et celles de ton équipe avec sagesse" },
    { icon: TrendingUp, title: "Personal Branding", desc: "Construis ta marque personnelle et ton influence professionnelle" },
    { icon: Globe, title: "Networking Stratégique", desc: "Crée et développe un réseau professionnel puissant" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Directrice Marketing",
      text: "Ce mentorat a transformé ma carrière. J'ai obtenu une promotion en 3 mois et je dirige maintenant une équipe de 15 personnes.",
      image: "👩‍💼"
    },
    {
      name: "Amina K.",
      role: "Entrepreneure",
      text: "Grâce à Rihab, j'ai lancé mon entreprise et signé mes premiers clients. Son accompagnement est en or !",
      image: "👩‍💻"
    },
    {
      name: "Léa D.",
      role: "Manager Senior",
      text: "J'ai enfin osé demander l'augmentation que je méritais. +40% de salaire et un nouveau poste de direction !",
      image: "👩‍🔬"
    }
  ];

  // Ouvre le checkout
  const openCheckout = () => {
    setShowCheckout(true);
    setCheckoutStep(1);
    setError('');
    setTimeout(() => {
      document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Validation email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Passe à l'étape 2 et crée le PaymentIntent
  const goToStep2 = async () => {
    // Validation des champs
    if (!checkoutData.email || !checkoutData.nom || !checkoutData.prenom || !checkoutData.acceptTerms) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!validateEmail(checkoutData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    if (!checkoutData.acceptTerms) {
      setError('Vous devez accepter les conditions générales');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: productInfo.id,
          email: checkoutData.email,
          nom: checkoutData.nom,
          prenom: checkoutData.prenom,
          telephone: checkoutData.telephone
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setCheckoutStep(2);

    } catch (err) {
      console.error('Erreur:', err);
      setError((err instanceof Error ? err.message : 'Erreur inconnue') || 'Erreur lors de l\'initialisation du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Place ça DANS ton composant (FutureLeaderSalesPage), au même niveau que les autres fonctions :

  // Helper: récupère l'id d'un contact via son email
  const findContactIdByEmail = async (email: string): Promise<number | null> => {
    try {
      const res = await fetch(
        `${API_URL}/api/contacts?email=${encodeURIComponent(email)}&limit=1&page=1`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (!res.ok) return null;
      const data = await res.json();

      // L'endpoint /contacts renvoie un objet du type:
      // { contacts: [...], total, page, limit, total_pages }
      const first = data?.contacts?.[0];
      return first?.id_utilisateur ?? null;
    } catch {
      return null;
    }
  };

  // Remplace TA fonction actuelle par celle-ci
  const handlePaymentSuccess = async () => {
    // tu gardes ton écran de succès
    setCheckoutStep(3);

    try {
      // 1) Création du contact
      const createPayload = {
        email: checkoutData.email,
        nom: checkoutData.nom || undefined,
        prenom: checkoutData.prenom || undefined,
        telephone: checkoutData.telephone || undefined,
        email_autorise: checkoutData.email_autorise ?? undefined,
      };

      let contactId: number | null = null;

      const createRes = await fetch(`${API_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createPayload),
      });

      if (createRes.ok) {
        // Créé => on récupère l'id dans la réponse
        const created = await createRes.json();
        // Réponse attendue: { message, contact: serialize_contact(contact) }
        contactId = created?.contact?.id_utilisateur ?? null;
      } else {
        // Peut-être "Un contact avec cet email existe déjà"
        const errData = await createRes.json().catch(() => ({} as any));
        const msg = (errData?.message || '').toLowerCase();

        if (createRes.status === 400 && msg.includes('existe déjà')) {
          // On va chercher l'id par email
          contactId = await findContactIdByEmail(checkoutData.email);
        } else {
          throw new Error(errData?.message || 'Erreur lors de la création du contact');
        }
      }

      // Si toujours pas d'id, on tente une dernière fois par recherche email
      if (!contactId) {
        contactId = await findContactIdByEmail(checkoutData.email);
      }

      if (!contactId) {
        throw new Error("Impossible de récupérer l'id du contact après création/recherche.");
      }

      // 2) Assignation du tag id = 1
      const tagRes = await fetch(`${API_URL}/api/contacts/${contactId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tag_ids: [1] }),
      });

      if (!tagRes.ok) {
        const t = await tagRes.json().catch(() => ({} as any));
        throw new Error(t?.message || "Erreur lors de l'assignation du tag.");
      }

      console.log(`✅ Tag 1 assigné au contact ${contactId}`);

    } catch (err) {
      console.error("❌ handlePaymentSuccess error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'enregistrement du contact."
      );
    }

    // (Optionnel) Tracking conversion ici…
  };


  // Reset du checkout
  const resetCheckout = () => {
    setShowCheckout(false);
    setCheckoutStep(1);
    setClientSecret(null);
    setOrderId(null);
    setError('');
    setCheckoutData({
      email: '',
      nom: '',
      prenom: '',
      telephone: '',
      acceptTerms: false,
      email_autorise: false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-white/90 backdrop-blur py-5'
        }`}>
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F22E77] to-[#7978E2] rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-[#F22E77]">Future Leader</span>
              <span className="block text-xs text-[#7978E2]">by Rihab Touré</span>
            </div>
          </div>
          <button
            onClick={openCheckout}
            className="bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white px-6 py-2 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Rejoindre le programme
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden bg-gradient-to-br from-[#7978E2]/5 via-white to-[#F22E77]/5">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-96 h-96 bg-[#42B4B7] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#F22E77] rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center bg-gradient-to-r from-[#F22E77]/10 to-[#7978E2]/10 backdrop-blur px-4 py-2 rounded-full mb-6 border border-[#7978E2]/20">
            <Sparkles className="w-5 h-5 text-[#7978E2] mr-2" />
            <span className="text-sm font-semibold text-[#7978E2]">12 semaines pour devenir une leader d'exception</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-[#7978E2]">Future</span>
            <span className="text-[#F22E77]"> Leader</span>
            <br />
            <span className="text-3xl md:text-4xl text-gray-700">Le mentorat qui propulse ta carrière</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Développe ton <span className="font-bold text-[#42B4B7]">leadership authentique</span>,
            booste ta <span className="font-bold text-[#F22E77]">confiance</span> et
            accélère ta <span className="font-bold text-[#7978E2]">carrière</span> avec
            un accompagnement personnalisé de haut niveau
          </p>

          {/* Urgency Timer */}
          <div className="bg-white/80 backdrop-blur border-2 border-[#F22E77]/30 rounded-2xl p-4 mb-8 inline-block shadow-lg">
            <p className="text-sm font-bold text-[#F22E77] mb-3">🔥 Prochaine session dans :</p>
            <div className="flex space-x-3 justify-center">
              <div className="bg-gradient-to-br from-[#F22E77]/10 to-[#F22E77]/5 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-[#F22E77]">{timeLeft.days}</span>
                <p className="text-xs text-gray-600">jours</p>
              </div>
              <div className="bg-gradient-to-br from-[#42B4B7]/10 to-[#42B4B7]/5 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-[#42B4B7]">{String(timeLeft.hours).padStart(2, '0')}</span>
                <p className="text-xs text-gray-600">heures</p>
              </div>
              <div className="bg-gradient-to-br from-[#7978E2]/10 to-[#7978E2]/5 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-[#7978E2]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <p className="text-xs text-gray-600">minutes</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={openCheckout}
              className="group bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center">
                Je veux ma place
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-4 shadow-xl border-t-4 border-[#F22E77] hover:scale-105 transition-all">
              <div className="text-3xl font-bold text-[#F22E77]">94%</div>
              <div className="text-xs text-gray-600">Obtiennent une promotion</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xl border-t-4 border-[#42B4B7] hover:scale-105 transition-all">
              <div className="text-3xl font-bold text-[#42B4B7]">+35%</div>
              <div className="text-xs text-gray-600">Augmentation de salaire</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xl border-t-4 border-[#7978E2] hover:scale-105 transition-all">
              <div className="text-3xl font-bold text-[#7978E2]">12</div>
              <div className="text-xs text-gray-600">Semaines de transformation</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xl border-t-4 border-[#F22E77] hover:scale-105 transition-all">
              <div className="text-3xl font-bold text-[#F22E77]">150+</div>
              <div className="text-xs text-gray-600">Leaders formées</div>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Modal/Section */}
      {showCheckout && (
        <section id="checkout-section" className="py-20 px-4 bg-gradient-to-br from-[#7978E2]/5 to-[#F22E77]/5">
          <div className="max-w-2xl mx-auto">
            {/* Step 1: Information */}
            {checkoutStep === 1 && (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#7978E2] via-[#42B4B7] to-[#F22E77] p-6 text-white relative">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-center">Inscription - Étape 1/2</h2>
                  <p className="text-center opacity-90">Tes informations</p>
                </div>

                <div className="p-8">
                  {/* Payment Options */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      Mode de paiement
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setCheckoutData({ ...checkoutData })}
                        className={`p-4 rounded-lg border-2 transition-all ${'border-[#F22E77] bg-[#F22E77]/10'
                          }`}
                      >
                        <div className="font-bold">Paiement unique</div>
                        <div className="text-2xl font-bold text-[#F22E77]">1997€</div>
                        <div className="text-xs text-gray-500 mt-1">Économise 50€</div>
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={checkoutData.email}
                        onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#7978E2] focus:outline-none transition-colors"
                        placeholder="ton.email@exemple.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={checkoutData.nom}
                        onChange={(e) => setCheckoutData({ ...checkoutData, nom: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#7978E2] focus:outline-none transition-colors"
                        placeholder="Prénom Nom"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={checkoutData.prenom}
                        onChange={(e) => setCheckoutData({ ...checkoutData, prenom: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#7978E2] focus:outline-none transition-colors"
                        placeholder="Prénom Nom"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={checkoutData.telephone}
                        onChange={(e) => setCheckoutData({ ...checkoutData, telephone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#7978E2] focus:outline-none transition-colors"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-3 mb-6">
                    <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={checkoutData.acceptTerms}
                        onChange={(e) => setCheckoutData({ ...checkoutData, acceptTerms: e.target.checked })}
                        className="mt-1 mr-3 w-4 h-4 text-[#7978E2] focus:ring-[#7978E2]"
                      />
                      <span className="text-sm text-gray-600">
                        J'accepte les <a href="#" className="text-[#7978E2] underline">conditions générales de vente</a> *
                      </span>
                    </label>

                    <label className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={checkoutData.email_autorise}
                        onChange={(e) => setCheckoutData({ ...checkoutData, email_autorise: e.target.checked })}
                        className="mt-1 mr-3 w-4 h-4 text-[#7978E2] focus:ring-[#7978E2]"
                      />
                      <span className="text-sm text-gray-600">
                        J'accepte de recevoir des emails sur le programme et les prochaines sessions
                      </span>
                    </label>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  )}

                  {/* Next Button */}
                  <button
                    onClick={goToStep2}
                    disabled={loading}
                    className={`w-full py-4 rounded-full font-bold text-white transition-all ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#F22E77] to-[#7978E2] hover:shadow-xl transform hover:scale-105'
                      }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader className="animate-spin mr-2 w-5 h-5" />
                        Chargement...
                      </span>
                    ) : (
                      <>
                        Continuer vers le paiement
                        <ChevronRight className="inline ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>

                  {/* Garanties */}
                  <div className="mt-6 flex justify-center space-x-6 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Paiement sécurisé
                    </span>
                    <span className="flex items-center">
                      <Lock className="w-4 h-4 mr-1" />
                      Données cryptées
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {checkoutStep === 2 && (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#7978E2] via-[#42B4B7] to-[#F22E77] p-6 text-white">
                  <h2 className="text-2xl font-bold text-center">Paiement sécurisé</h2>
                  <p className="text-center opacity-90">Étape 2/2</p>
                </div>

                <div className="p-8">
                  {/* Recap */}
                  <div className="bg-gradient-to-br from-[#7978E2]/10 to-[#F22E77]/10 rounded-xl p-6 mb-6">
                    <h3 className="font-bold mb-3">Récapitulatif de commande</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Programme Future Leader (12 semaines)</span>
                        <span className="font-bold">1997€</span>
                      </div>
                      <div className="flex justify-between text-[#42B4B7]">
                        <span>✨ Bonus offerts</span>
                        <span className="font-bold line-through">641€</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>À payer</span>
                          <span className="text-[#F22E77]">{productInfo.price}€</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stripe Payment Element */}
                  {!clientSecret ? (
                    <div className="text-center py-8">
                      <Loader className="animate-spin w-8 h-8 mx-auto text-[#7978E2]" />
                      <p className="mt-2 text-gray-600">Préparation du paiement sécurisé...</p>
                    </div>
                  ) : (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: '#7978E2',
                            colorBackground: '#ffffff',
                            colorText: '#30303',
                            colorDanger: '#F22E77',
                            fontFamily: 'system-ui, sans-serif',
                            borderRadius: '8px',
                          },
                        },
                      }}
                    >
                      <CheckoutPaymentForm
                        onBack={() => setCheckoutStep(1)}
                        onSuccess={handlePaymentSuccess}
                        setError={setError}
                        checkoutData={checkoutData}
                      />
                    </Elements>
                  )}

                  {/* Error display */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  )}

                  {/* Security badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Lock className="w-4 h-4 mr-1 text-green-500" />
                        Paiement 100% sécurisé
                      </span>
                      <span className="flex items-center">
                        <Shield className="w-4 h-4 mr-1 text-blue-500" />
                        Cryptage SSL
                      </span>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Powered by Stripe - Leader mondial du paiement en ligne
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {checkoutStep === 3 && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Check className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  🎉 Inscription confirmée !
                </h2>

                <p className="text-gray-600 mb-6">
                  Félicitations <span className="font-bold text-[#7978E2]">{checkoutData.prenom}</span> !
                  Tu fais maintenant partie du programme Future Leader.
                </p>

                <div className="bg-gradient-to-br from-[#7978E2]/10 to-[#F22E77]/10 rounded-xl p-6 mb-6 text-left">
                  <p className="text-sm font-semibold text-[#7978E2] mb-3">
                    ✨ Prochaines étapes :
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Email de bienvenue envoyé à <span className="font-semibold">{checkoutData.email}</span></span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Accès au groupe Discord privé (lien dans l'email)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Accès à la plateforme de formation dans 24h</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={resetCheckout}
                  className="bg-gradient-to-r from-[#F22E77] to-[#7978E2] text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Retour à l'accueil
                </button>

                <p className="mt-6 text-sm text-gray-500">
                  Une question ? Contacte-nous à support@future-leader.com
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#7978E2]/5 to-[#42B4B7]/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Elles sont devenues des <span className="text-[#F22E77]">Leaders</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-3">{testimonial.image}</div>
                  <div>
                    <p className="font-bold text-[#7978E2]">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#F22E77] text-[#F22E77]" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Modules */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="text-[#F22E77]">12 Modules</span> pour devenir une
            <span className="text-[#7978E2]"> Leader d'Exception</span>
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Un parcours complet et progressif pour transformer ton potentiel en succès
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, i) => (
              <div
                key={i}
                onMouseEnter={() => setActiveModule(i)}
                className={`group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${activeModule === i ? 'border-[#F22E77]' : 'border-gray-100'
                  }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${activeModule === i
                    ? 'bg-gradient-to-br from-[#F22E77] to-[#7978E2]'
                    : 'bg-gradient-to-br from-[#42B4B7]/20 to-[#7978E2]/20'
                  }`}>
                  <module.icon className={`w-7 h-7 ${activeModule === i ? 'text-white' : 'text-[#7978E2]'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${activeModule === i ? 'text-[#F22E77]' : 'text-gray-800'}`}>
                  Module {i + 1}: {module.title}
                </h3>
                <p className="text-gray-600 text-sm">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA if checkout not open */}
      {!showCheckout && (
        <section className="py-20 px-4 bg-gradient-to-br from-[#F22E77] via-[#42B4B7] to-[#7978E2] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Es-tu prête à devenir une <span className="text-white">Leader d'Exception</span> ?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Ne laisse pas passer cette opportunité. Les places sont limitées et la prochaine session commence bientôt.
            </p>

            <button
              onClick={openCheckout}
              className="bg-white text-[#F22E77] px-10 py-5 rounded-full text-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
            >
              Je veux ma transformation maintenant ! 🚀
            </button>

            <p className="mt-8 text-white/80 text-sm">
              Plus de 150 femmes ont déjà transformé leur carrière. À ton tour !
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white py-8 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <p className="font-bold text-[#7978E2]">Future Leader by Rihab Touré</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-[#F22E77] transition-colors">Conditions Générales</a>
            <span className="text-gray-400">•</span>
            <a href="#" className="hover:text-[#42B4B7] transition-colors">Mentions Légales</a>
            <span className="text-gray-400">•</span>
            <a href="#" className="hover:text-[#7978E2] transition-colors">Politique de Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}