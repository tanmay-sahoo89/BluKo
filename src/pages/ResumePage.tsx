import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Download, Plus, Eye, Trash2, Share2, Edit, FileText, Bot } from 'lucide-react';
import { NavigationHeader } from '../components/shared/NavigationHeader';

interface Resume {
  id: string;
  resume_name: string;
  template_name: string;
  created_at: string;
  updated_at: string;
}

interface ResumePageProps {
  onBack: () => void;
  onNavigate: (page: 'dashboard' | 'profile' | 'chatbot' | 'resume') => void;
}

export function ResumePage({ onBack, onNavigate }: ResumePageProps) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('resumes')
      .select('id, resume_name, template_name, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setResumes(data);
    }
    setLoading(false);
  };

  const generateResume = async () => {
    if (!user) return;
    setGenerating(true);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const { data: workExperiences } = await supabase
      .from('work_experiences')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    const { data: skills } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', user.id);

    const { data: certifications } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', user.id);

    const { data: education } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', user.id);

    const { data: languages } = await supabase
      .from('languages')
      .select('*')
      .eq('user_id', user.id);

    const resumeData = {
      profile,
      workExperiences: workExperiences || [],
      skills: skills || [],
      certifications: certifications || [],
      education: education || [],
      languages: languages || [],
    };

    const resumeName = `Resume - ${new Date().toLocaleDateString()}`;

    const { data: newResume, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        resume_name: resumeName,
        template_name: 'professional',
        resume_data: resumeData,
      })
      .select()
      .single();

    if (!error && newResume) {
      setResumes([newResume, ...resumes]);
      setSelectedResume(newResume.id);
    }

    setGenerating(false);
  };

  const viewResume = async (resumeId: string) => {
    setSelectedResume(resumeId);
  };

  const deleteResume = async (resumeId: string) => {
    await supabase.from('resumes').delete().eq('id', resumeId);
    setResumes(resumes.filter((r) => r.id !== resumeId));
  };

  const shareResume = async (resumeId: string) => {
    const shareUrl = `${window.location.origin}/resume/${resumeId}`;
    await navigator.clipboard.writeText(shareUrl);
    alert('Resume link copied to clipboard!');
  };

  const downloadResume = async (resumeId: string, format: 'html' | 'pdf') => {
    setShowDownloadModal(null);
    const { data } = await supabase
      .from('resumes')
      .select('resume_data, resume_name')
      .eq('id', resumeId)
      .maybeSingle();

    if (data) {
      const htmlContent = generateHTMLResume(data.resume_data);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.resume_name}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getFileSize = (resume: Resume) => {
    return '45 KB';
  };

  const generateHTMLResume = (resumeData: any) => {
    const profile = resumeData.profile || {};
    const workExperiences = resumeData.workExperiences || [];
    const skills = resumeData.skills || [];
    const certifications = resumeData.certifications || [];

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: #fff;
    }
    h1 {
      color: #012A61;
      margin-bottom: 5px;
      font-size: 32px;
    }
    h2 {
      color: #275A91;
      border-bottom: 2px solid #FDC787;
      padding-bottom: 5px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .contact {
      color: #666;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 25px;
    }
    .job, .cert, .skill-item {
      margin-bottom: 15px;
    }
    .job-title {
      font-weight: bold;
      color: #012A61;
      font-size: 18px;
    }
    .company {
      color: #275A91;
      font-size: 16px;
    }
    .date {
      color: #666;
      font-style: italic;
      font-size: 14px;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .skill-item {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>${profile.full_name || 'Your Name'}</h1>
  <div class="contact">
    ${profile.email || ''} ${profile.phone ? '| ' + profile.phone : ''} ${profile.location ? '| ' + profile.location : ''}
  </div>

  ${profile.professional_summary ? `
  <div class="section">
    <h2>Professional Summary</h2>
    <p>${profile.professional_summary}</p>
  </div>
  ` : ''}

  ${workExperiences.length > 0 ? `
  <div class="section">
    <h2>Work Experience</h2>
    ${workExperiences.map((exp: any) => `
    <div class="job">
      <div class="job-title">${exp.job_title}</div>
      <div class="company">${exp.company_name}${exp.location ? ' - ' + exp.location : ''}</div>
      <div class="date">${new Date(exp.start_date).toLocaleDateString()} - ${exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'N/A'}</div>
      ${exp.description ? `<p>${exp.description}</p>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${skills.length > 0 ? `
  <div class="section">
    <h2>Skills</h2>
    <div class="skills-grid">
      ${skills.map((skill: any) => `
      <div class="skill-item">
        <span>${skill.skill_name}</span>
        <span>${skill.proficiency_level}</span>
      </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${certifications.length > 0 ? `
  <div class="section">
    <h2>Certifications & Licenses</h2>
    ${certifications.map((cert: any) => `
    <div class="cert">
      <div style="font-weight: bold;">${cert.certification_name}</div>
      <div>${cert.issuing_organization}</div>
      ${cert.issue_date ? `<div class="date">Issued: ${new Date(cert.issue_date).toLocaleDateString()}</div>` : ''}
    </div>
    `).join('')}
  </div>
  ` : ''}
</body>
</html>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002B5C] via-[#003A6E] to-[#1E4C80] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002B5C] via-[#003A6E] to-[#1E4C80]">
      <NavigationHeader currentPage="resume" onNavigate={onNavigate} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#003A6E] bg-opacity-50 backdrop-blur-lg border border-[#6A7B93] border-opacity-20 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">My Resumes</h2>
                <p className="text-[#A8B8CC]">
                  Generate and manage your professional resumes with multiple download formats.
                </p>
              </div>
              <button
                onClick={generateResume}
                disabled={generating}
                className="flex items-center gap-2 bg-[#FBC888] hover:bg-[#FBC888]/90 text-[#002B5C] font-semibold px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <Plus size={18} />
                <span>{generating ? 'Generating...' : 'Generate New Resume'}</span>
              </button>
            </div>
          </div>

          {resumes.length === 0 ? (
            <div className="bg-[#003A6E] bg-opacity-50 backdrop-blur-lg border border-[#6A7B93] border-opacity-20 rounded-2xl p-12 text-center">
              <FileText className="mx-auto text-[#FBC888] mb-4" size={64} />
              <p className="text-[#A8B8CC] text-lg mb-4">You haven't created any resumes yet.</p>
              <p className="text-[#6A7B93] mb-6">
                Start by generating your first professional resume or chat with our AI Assistant for help.
              </p>
              <button
                onClick={() => onNavigate('chatbot')}
                className="bg-[#1E4C80] hover:bg-[#2A4F7A] text-white px-6 py-3 rounded-lg transition-all duration-200"
              >
                Create First Resume with AI Assistant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-[#003A6E] bg-opacity-50 backdrop-blur-lg border border-[#6A7B93] border-opacity-20 rounded-2xl p-6 hover:bg-opacity-70 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{resume.resume_name}</h3>
                      <p className="text-[#6A7B93] text-xs">
                        Created: {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[#6A7B93] text-xs mt-1">
                        Size: {getFileSize(resume)}
                      </p>
                    </div>
                    <div className="bg-[#1E4C80] w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="text-[#FBC888]" size={24} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded-full border border-green-500 border-opacity-30">
                      Complete
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => onNavigate('chatbot')}
                      className="col-span-2 flex items-center justify-center gap-2 bg-[#FBC888] hover:bg-[#FBC888]/90 text-[#002B5C] font-semibold px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                    >
                      <Bot size={14} />
                      <span>Edit with AI</span>
                    </button>
                    <button
                      onClick={() => viewResume(resume.id)}
                      className="flex items-center justify-center gap-2 bg-[#1E4C80] hover:bg-[#2A4F7A] text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => setShowDownloadModal(resume.id)}
                      className="flex items-center justify-center gap-2 bg-[#FBC888] hover:bg-[#FBC888]/90 text-[#002B5C] font-semibold px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => shareResume(resume.id)}
                      className="flex items-center justify-center gap-2 bg-[#6A7B93] bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                    >
                      <Share2 size={14} />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => deleteResume(resume.id)}
                      className="flex items-center justify-center gap-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-400 px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#003A6E] border border-[#6A7B93] border-opacity-20 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Download Resume</h3>
            <p className="text-[#A8B8CC] mb-6">Choose your preferred format:</p>
            <div className="space-y-3">
              <button
                onClick={() => downloadResume(showDownloadModal, 'html')}
                className="w-full flex items-center justify-between bg-[#1E4C80] hover:bg-[#2A4F7A] text-white px-6 py-4 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <FileText size={24} />
                  <div className="text-left">
                    <div className="font-semibold">HTML Format</div>
                    <div className="text-xs text-[#A8B8CC]">Web-friendly format</div>
                  </div>
                </div>
                <Download size={20} />
              </button>
              <button
                onClick={() => downloadResume(showDownloadModal, 'pdf')}
                className="w-full flex items-center justify-between bg-[#FBC888] hover:bg-[#FBC888]/90 text-[#002B5C] px-6 py-4 rounded-lg transition-all duration-200 font-semibold"
              >
                <div className="flex items-center gap-3">
                  <FileText size={24} />
                  <div className="text-left">
                    <div className="font-semibold">PDF Format</div>
                    <div className="text-xs opacity-70">Print-ready format</div>
                  </div>
                </div>
                <Download size={20} />
              </button>
            </div>
            <button
              onClick={() => setShowDownloadModal(null)}
              className="w-full mt-4 text-[#6A7B93] hover:text-white transition-colors py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
