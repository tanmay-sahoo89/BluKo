import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, Plus, Trash2, Edit } from 'lucide-react';
import { NavigationHeader } from '../components/shared/NavigationHeader';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  professional_summary: string | null;
}

interface WorkExperience {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
}

interface Skill {
  id: string;
  skill_name: string;
  proficiency_level: string;
}

interface Certification {
  id: string;
  certification_name: string;
  issuing_organization: string;
  issue_date: string;
}

interface ProfilePageProps {
  onBack: () => void;
  onNavigate: (page: 'dashboard' | 'profile' | 'chatbot' | 'resume') => void;
}

export function ProfilePage({ onBack, onNavigate }: ProfilePageProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    phone: null,
    location: null,
    professional_summary: null,
  });
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: workData } = await supabase
      .from('work_experiences')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (workData) {
      setWorkExperiences(workData);
    }

    const { data: skillsData } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', user.id);

    if (skillsData) {
      setSkills(skillsData);
    }

    const { data: certsData } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', user.id);

    if (certsData) {
      setCertifications(certsData);
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    await supabase
      .from('user_profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        location: profile.location,
        professional_summary: profile.professional_summary,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);
  };

  const addSkill = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('skills')
      .insert({
        user_id: user.id,
        skill_name: 'New Skill',
        proficiency_level: 'Intermediate',
      })
      .select()
      .single();

    if (data) {
      setSkills([...skills, data]);
    }
  };

  const deleteSkill = async (id: string) => {
    await supabase.from('skills').delete().eq('id', id);
    setSkills(skills.filter((s) => s.id !== id));
  };

  const addCertification = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('certifications')
      .insert({
        user_id: user.id,
        certification_name: 'New Certification',
        issuing_organization: 'Organization',
        issue_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (data) {
      setCertifications([...certifications, data]);
    }
  };

  const deleteCertification = async (id: string) => {
    await supabase.from('certifications').delete().eq('id', id);
    setCertifications(certifications.filter((c) => c.id !== id));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#021334] via-[#012A61] to-[#275A91] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021334] via-[#012A61] to-[#275A91]">
      <NavigationHeader currentPage="profile" onNavigate={onNavigate} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-[#012A61] bg-opacity-50 backdrop-blur-lg border border-[#A5CCCC] border-opacity-20 rounded-2xl p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#275A91] to-[#FDC787] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.full_name ? getInitials(profile.full_name) : 'U'}
                </div>
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center cursor-pointer">
                  <Edit className="opacity-0 group-hover:opacity-100 text-white" size={20} />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{profile.full_name || 'User Profile'}</h2>
                <p className="text-gray-300 mb-4">{profile.email}</p>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#FDC787] hover:bg-[#FDC787]/90 text-[#021334] font-semibold px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-[#A5CCCC] border-opacity-20 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full bg-[#A5CCCC] bg-opacity-20 border border-[#A5CCCC] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FDC787]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-[#A5CCCC] bg-opacity-10 border border-[#A5CCCC] border-opacity-30 rounded-lg text-gray-400 px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-[#A5CCCC] bg-opacity-20 border border-[#A5CCCC] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FDC787]"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full bg-[#A5CCCC] bg-opacity-20 border border-[#A5CCCC] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FDC787]"
                  placeholder="City, State"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">Professional Summary</label>
                <textarea
                  value={profile.professional_summary || ''}
                  onChange={(e) => setProfile({ ...profile, professional_summary: e.target.value })}
                  rows={4}
                  className="w-full bg-[#A5CCCC] bg-opacity-20 border border-[#A5CCCC] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FDC787]"
                  placeholder="Brief summary of your professional background and skills..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#012A61] bg-opacity-50 backdrop-blur-lg border border-[#A5CCCC] border-opacity-20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Skills</h2>
              <button
                onClick={addSkill}
                className="flex items-center gap-2 bg-[#275A91] hover:bg-[#275A91]/80 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Plus size={18} />
                <span>Add Skill</span>
              </button>
            </div>
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="flex gap-3">
                  <input
                    type="text"
                    value={skill.skill_name}
                    onChange={async (e) => {
                      await supabase
                        .from('skills')
                        .update({ skill_name: e.target.value })
                        .eq('id', skill.id);
                      setSkills(skills.map((s) => (s.id === skill.id ? { ...s, skill_name: e.target.value } : s)));
                    }}
                    className="flex-1 bg-[#A5CCCC] bg-opacity-20 border border-[#A5CCCC] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FDC787]"
                  />
                  <select
                    value={skill.proficiency_level}
                    onChange={async (e) => {
                      await supabase
                        .from('skills')
                        .update({ proficiency_level: e.target.value })
                        .eq('id', skill.id);
                      setSkills(skills.map((s) => (s.id === skill.id ? { ...s, proficiency_level: e.target.value } : s)));
                    }}
                    className="bg-[#A5CCCC] bg-opacity-20 border border-[#A5CCCC] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FDC787]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    onClick={() => deleteSkill(skill.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all duration-200"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#012A61] bg-opacity-50 backdrop-blur-lg border border-[#A5CCCC] border-opacity-20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Certifications</h2>
              <button
                onClick={addCertification}
                className="flex items-center gap-2 bg-[#275A91] hover:bg-[#275A91]/80 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Plus size={18} />
                <span>Add Certification</span>
              </button>
            </div>
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex gap-3">
                  <input
                    type="text"
                    value={cert.certification_name}
                    onChange={async (e) => {
                      await supabase
                        .from('certifications')
                        .update({ certification_name: e.target.value })
                        .eq('id', cert.id);
                      setCertifications(certifications.map((c) => (c.id === cert.id ? { ...c, certification_name: e.target.value } : c)));
                    }}
                    className="flex-1 bg-[#A5CCCC] bg-opacity-20 border border-[#A5CCCC] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FDC787]"
                    placeholder="Certification Name"
                  />
                  <input
                    type="text"
                    value={cert.issuing_organization}
                    onChange={async (e) => {
                      await supabase
                        .from('certifications')
                        .update({ issuing_organization: e.target.value })
                        .eq('id', cert.id);
                      setCertifications(certifications.map((c) => (c.id === cert.id ? { ...c, issuing_organization: e.target.value } : c)));
                    }}
                    className="flex-1 bg-[#A5CCCC] bg-opacity-20 border border-[#A5CCCC] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FDC787]"
                    placeholder="Issuing Organization"
                  />
                  <button
                    onClick={() => deleteCertification(cert.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all duration-200"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
