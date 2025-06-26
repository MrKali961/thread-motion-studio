
import { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo('.contact-info',
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo('.contact-form',
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    reset();
  };

  return (
    <section id="contact" ref={sectionRef} className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="contact-title text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              GET IN TOUCH
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to create something amazing together? Let's start the conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="contact-info space-y-8">
            <div className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-3xl font-bold text-white mb-8">Let's Connect</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Email</h4>
                    <p className="text-gray-300">hello@luxebrand.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Phone</h4>
                    <p className="text-gray-300">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Address</h4>
                    <p className="text-gray-300">123 Fashion Ave, New York, NY 10001</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {['Instagram', 'Twitter', 'Facebook', 'LinkedIn'].map((social) => (
                    <button
                      key={social}
                      className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all duration-300"
                    >
                      <span className="text-sm font-bold">{social[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Email</label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Subject</label>
                <input
                  {...register('subject', { required: 'Subject is required' })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="What's this about?"
                />
                {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Message</label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                  placeholder="Tell us more about your project..."
                />
                {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
