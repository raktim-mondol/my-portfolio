import React, { useState, useRef } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import emailjs from '@emailjs/browser';
import toast, { Toaster } from 'react-hot-toast';

// Email service credentials
const SERVICE_ID = 'service_pf60vvq';
const TEMPLATE_ID = 'template_khtz52h';
const PUBLIC_KEY = 'YNARHMC0iqRPaRFIf';

// Common email domains for validation
const commonEmailDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'unsw.edu.au',
  'student.unsw.edu.au',
  'rmit.edu.au',
  'student.rmit.edu.au'
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    to_name: 'Raktim',
    from_name: '',
    from_email: '',
    message: ''
  });

  const validateEmail = (email: string) => {
    // Strict email format check including complete domain requirement
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!strictEmailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a complete email address including domain (e.g., @gmail.com)' };
    }

    // Split email into local part and domain
    const [localPart, domain] = email.toLowerCase().split('@');

    // Check local part
    if (localPart.length < 3) {
      return { isValid: false, message: 'Email username must be at least 3 characters long' };
    }

    if (localPart.length > 64) {
      return { isValid: false, message: 'Email username is too long' };
    }

    // Check for consecutive special characters
    if (/[._%+-]{2,}/.test(localPart)) {
      return { isValid: false, message: 'Email cannot contain consecutive special characters' };
    }

    // Check for invalid characters in local part
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]$/.test(localPart)) {
      return { isValid: false, message: 'Email username contains invalid characters or format' };
    }

    // Check domain
    if (domain.length > 255 || domain.length < 4) { // Minimum domain length (e.g., a.com)
      return { isValid: false, message: 'Invalid email domain length' };
    }

    // Check if domain has at least one period and valid TLD
    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      return { isValid: false, message: 'Email must include a complete domain (e.g., gmail.com)' };
    }

    // Validate TLD (Top Level Domain)
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || tld.length > 6) {
      return { isValid: false, message: 'Invalid top-level domain' };
    }

    // Check for common typos in popular domains
    const domainTypos = {
      'gmail.com': ['gamil.com', 'gmial.com', 'gmal.com', 'gmall.com', 'gmil.com', 'gmaill.com', 'gmail'],
      'yahoo.com': ['yaho.com', 'yahooo.com', 'yahhoo.com', 'yhoo.com', 'yahoo'],
      'hotmail.com': ['hotmal.com', 'hotmial.com', 'hotmall.com', 'hotmai.com', 'hotmail'],
      'outlook.com': ['outlok.com', 'outlook.co', 'outlock.com', 'outlook']
    };

    for (const [correctDomain, typos] of Object.entries(domainTypos)) {
      if (typos.includes(domain)) {
        return { isValid: false, message: `Did you mean ${correctDomain}?` };
      }
    }

    // Suggest common domains if the domain is not recognized
    if (!commonEmailDomains.includes(domain)) {
      // Allow educational and business domains to pass
      if (!domain.endsWith('.edu') && !domain.endsWith('.edu.au') && !domain.endsWith('.com.au') && !domain.endsWith('.org') && !domain.endsWith('.gov')) {
        return { isValid: false, message: 'Please verify your email domain' };
      }
    }

    return { isValid: true, message: '' };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name === 'user_name' ? 'from_name' : name === 'user_email' ? 'from_email' : name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(formData.from_email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.message);
      return;
    }

    if (!window.confirm('Are you sure you want to send this message?')) {
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Sending message...');

    try {
      const result = await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        formRef.current!,
        PUBLIC_KEY
      );

      if (result.text === 'OK') {
        toast.dismiss(loadingToast);
        toast.success('Email sent successfully! I will get back to you soon.');
        setFormData({ to_name: 'Raktim', from_name: '', from_email: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to send message. Please try again.');
      console.error('Email error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Get in Touch</h2>
          <p className="mt-4 text-xl text-gray-600">
            Interested in collaboration? Let's discuss your research ideas.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="relative bg-white rounded-lg shadow-md p-8">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="to_name" value={formData.to_name} />
              <div>
                <label htmlFor="from_name" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  name="from_name"
                  id="from_name"
                  value={formData.from_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#94c973] focus:border-[#94c973]"
                />
              </div>
              <div>
                <label htmlFor="from_email" className="block text-sm font-medium text-gray-700">
                  Your Email Address
                </label>
                <input
                  type="email"
                  name="from_email"
                  id="from_email"
                  value={formData.from_email}
                  onChange={handleChange}
                  required
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                  title="Please enter a valid email address with a complete domain (e.g., example@gmail.com)"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#94c973] focus:border-[#94c973]"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#94c973] focus:border-[#94c973] resize-none"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#94c973] hover:bg-[#7fb95e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#94c973] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

          <div className="relative bg-white rounded-lg shadow-md p-8">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-[#94c973]" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Location</h3>
                  <p className="mt-2 text-gray-600">
                    School of Computer Science and Engineering<br />
                    Building K17<br />
                    UNSW Sydney, NSW 2052
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-[#94c973]" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Email</h3>
                  <p className="mt-2 text-gray-600">r.mondol@unsw.edu.au</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-[#94c973]" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                  <p className="mt-2 text-gray-600">+61 412 936 237</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </section>
  );
}
