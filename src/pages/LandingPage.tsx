import { useState } from 'react';
import { SignUpForm } from '../components/auth/SignUpForm';
import { SignInForm } from '../components/auth/SignInForm';
import { Briefcase, FileText, MessageSquare, Award } from 'lucide-react';

export function LandingPage() {
  const [showSignUp, setShowSignUp] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021334] via-[#012A61] to-[#275A91]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-screen">
          <div className="flex-1 text-white space-y-8 max-w-2xl">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Build Your Professional Resume with{' '}
                <span className="text-[#FDC787]">AI Assistance</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Designed specifically for blue collar workers. Create, manage, and download professional resumes that showcase your skills, certifications, and experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="bg-[#A5CCCC] bg-opacity-10 backdrop-blur-sm border border-[#A5CCCC] border-opacity-20 rounded-lg p-6 space-y-3 hover:bg-opacity-20 transition-all duration-300">
                <div className="bg-[#275A91] w-12 h-12 rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-[#FDC787]" size={24} />
                </div>
                <h3 className="text-lg font-semibold">AI Chatbot Assistant</h3>
                <p className="text-gray-300 text-sm">
                  Interactive chatbot guides you through building your resume step by step.
                </p>
              </div>

              <div className="bg-[#A5CCCC] bg-opacity-10 backdrop-blur-sm border border-[#A5CCCC] border-opacity-20 rounded-lg p-6 space-y-3 hover:bg-opacity-20 transition-all duration-300">
                <div className="bg-[#275A91] w-12 h-12 rounded-lg flex items-center justify-center">
                  <FileText className="text-[#FDC787]" size={24} />
                </div>
                <h3 className="text-lg font-semibold">Professional Templates</h3>
                <p className="text-gray-300 text-sm">
                  Choose from industry-standard resume templates and download as PDF.
                </p>
              </div>

              <div className="bg-[#A5CCCC] bg-opacity-10 backdrop-blur-sm border border-[#A5CCCC] border-opacity-20 rounded-lg p-6 space-y-3 hover:bg-opacity-20 transition-all duration-300">
                <div className="bg-[#275A91] w-12 h-12 rounded-lg flex items-center justify-center">
                  <Award className="text-[#FDC787]" size={24} />
                </div>
                <h3 className="text-lg font-semibold">Skills & Certifications</h3>
                <p className="text-gray-300 text-sm">
                  Showcase your certifications, licenses, and professional skills.
                </p>
              </div>

              <div className="bg-[#A5CCCC] bg-opacity-10 backdrop-blur-sm border border-[#A5CCCC] border-opacity-20 rounded-lg p-6 space-y-3 hover:bg-opacity-20 transition-all duration-300">
                <div className="bg-[#275A91] w-12 h-12 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-[#FDC787]" size={24} />
                </div>
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <p className="text-gray-300 text-sm">
                  Organize and highlight your professional work history effectively.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto lg:flex-shrink-0">
            <div className="bg-[#012A61] bg-opacity-50 backdrop-blur-lg border border-[#A5CCCC] border-opacity-20 rounded-2xl shadow-2xl p-8 w-full lg:w-[450px]">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {showSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-300">
                  {showSignUp
                    ? 'Start building your professional resume today'
                    : 'Sign in to continue building your resume'}
                </p>
              </div>

              {showSignUp ? (
                <SignUpForm onToggle={() => setShowSignUp(false)} />
              ) : (
                <SignInForm onToggle={() => setShowSignUp(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
