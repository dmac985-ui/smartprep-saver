import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Button variant="ghost" onClick={() => navigate(createPageUrl('Home'))} className="mb-8 text-slate-600">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Button>

      <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-slate-500 mb-10">Last updated: February 24, 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
          <p>SmartPrep Saver ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our app.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Profile Information:</strong> Age, gender, height, weight, activity level, ZIP code, and dietary preferences you provide during onboarding.</li>
            <li><strong>Health Goals:</strong> Weight management goals, calorie targets, allergies, and food restrictions.</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, and interactions within the app.</li>
            <li><strong>Account Information:</strong> Email address used to log in.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To generate personalized AI meal plans tailored to your profile and goals.</li>
            <li>To find local grocery deals near your ZIP code.</li>
            <li>To track your nutrition progress over time.</li>
            <li>To improve our AI algorithms and app features.</li>
            <li>To send you relevant notifications (only with your consent).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Sharing</h2>
          <p>We do <strong>not</strong> sell your personal data. We may share data with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI service providers (e.g., for meal plan generation) — under strict data processing agreements.</li>
            <li>Analytics providers to help us understand how the app is used — anonymized only.</li>
            <li>Law enforcement, if required by law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Retention & Deletion</h2>
          <p>We retain your data for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us at <strong>privacy@smartprepsaver.com</strong>. We will process deletion requests within 30 days.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Security</h2>
          <p>We use industry-standard encryption (TLS) for data in transit and encryption at rest for sensitive fields. However, no method of electronic storage is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. Health Disclaimer</h2>
          <p className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
            <strong>SmartPrep Saver is for informational and educational purposes only.</strong> The content provided is not intended as medical advice, nutritional counseling, or a substitute for professional healthcare. Always consult a qualified healthcare provider before making significant changes to your diet or exercise routine, especially if you have a medical condition.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. Children's Privacy</h2>
          <p>SmartPrep Saver is not directed at children under 13. We do not knowingly collect data from children under 13.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">9. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Opt out of marketing communications.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact Us</h2>
          <p>For privacy-related questions or requests, contact us at: <strong>privacy@smartprepsaver.com</strong></p>
        </section>
      </div>
    </div>
  );
}