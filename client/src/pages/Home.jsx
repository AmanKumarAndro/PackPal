import React from 'react';
import { 
  MapPin, 
  Cloud, 
  Package, 
  Brain, 
  Users, 
  Star,
  ArrowRight,
  Luggage,
  Check,
  Globe,
  Zap
} from 'lucide-react';

const Home = () => {
  // Mock auth state for demo
  const isAuthenticated = false;
  const user = null;

  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      title: "Smart Trip Planning",
      description: "Plan your destinations with intelligent suggestions and real-time information."
    },
    {
      icon: <Cloud className="h-8 w-8 text-blue-600" />,
      title: "Weather Integration",
      description: "Get accurate weather forecasts to pack appropriately for your trip."
    },
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Packing",
      description: "Receive personalized packing suggestions based on your destination and activities."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Community Sharing",
      description: "Share your trips and learn from other travelers' experiences."
    }
  ];

  const benefits = [
    "Never forget essential items again",
    "Save time with smart suggestions",
    "Weather-optimized packing lists",
    "Community-tested travel tips"
  ];

  return (
    <div className="min-h-screen bg-white">
 
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4" />
                <span>AI-Powered Travel Assistant</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Pack Smart,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Travel Better
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your intelligent travel companion that helps you plan trips, get weather updates, 
              and receive AI-powered packing suggestions for the perfect journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {!isAuthenticated ? (
                <>
                  <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center">
                    Start Planning
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-semibold border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                    Watch Demo
                  </button>
                </>
              ) : (
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Benefits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-center space-x-3 text-gray-700">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <Star className="h-4 w-4" />
                <span>Premium Features</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for Perfect Trips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              PackPal combines intelligent planning with community insights to make your travels seamless and stress-free.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full mix-blend-soft-light filter blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full mix-blend-soft-light filter blur-xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Travelers Worldwide
            </h2>
            <p className="text-blue-100 text-lg">
              Join our growing community of smart travelers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "50K+", label: "Trips Planned", icon: <Globe className="h-6 w-6" /> },
              { number: "25K+", label: "Happy Travelers", icon: <Users className="h-6 w-6" /> },
              { number: "99%", label: "Satisfaction Rate", icon: <Star className="h-6 w-6" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex justify-center mb-4">
                  <div className="text-white/80">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Start Your Next Adventure?
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Join thousands of travelers who trust PackPal for their journey planning and never worry about forgetting essentials again.
          </p>
          {!isAuthenticated && (
            <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center mx-auto">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </section>

      
    </div>
  );
};

export default Home;