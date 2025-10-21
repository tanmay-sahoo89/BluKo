import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, Plus, Trash2, Edit, Briefcase } from 'lucide-react';
import { NavigationHeader } from '../components/shared/NavigationHeader';
import { Notification } from '../components/shared/Notification';

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
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

    try {
      const { error } = await supabase
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

      if (error) throw error;

      setNotification({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const addWorkExperience = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('work_experiences')
      .insert({
        user_id: user.id,
        job_title: 'Job Title',
        company_name: 'Company Name',
        location: '',
        start_date: new Date().toISOString().split('T')[0],
        is_current: false,
        description: '',
      })
      .select()
      .single();

    if (data) {
      setWorkExperiences([data, ...workExperiences]);
    }
  };

  const updateWorkExperience = async (id: string, field: string, value: any) => {
    await supabase
      .from('work_experiences')
      .update({ [field]: value })
      .eq('id', id);

    setWorkExperiences(workExperiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)));
  };

  const deleteWorkExperience = async (id: string) => {
    await supabase.from('work_experiences').delete().eq('id', id);
    setWorkExperiences(workExperiences.filter((exp) => exp.id !== id));
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

  const updateSkill = async (id: string, field: string, value: string) => {
    await supabase
      .from('skills')
      .update({ [field]: value })
      .eq('id', id);

    setSkills(skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
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

  const updateCertification = async (id: string, field: string, value: string) => {
    await supabase
      .from('certifications')
      .update({ [field]: value })
      .eq('id', id);

    setCertifications(certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
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
      <div className="min-h-screen bg-gradient-to-br from-[#002B5C] via-[#003A6E] to-[#1E4C80] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002B5C] via-[#003A6E] to-[#1E4C80]">
      <NavigationHeader currentPage="profile" onNavigate={onNavigate} />

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-[#003A6E] bg-opacity-50 backdrop-blur-lg border border-[#6A7B93] border-opacity-20 rounded-2xl p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E4C80] to-[#FBC888] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.full_name ? getInitials(profile.full_name) : 'U'}
                </div>
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center cursor-pointer">
                  <Edit className="opacity-0 group-hover:opacity-100 text-white" size={20} />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{profile.full_name || 'User Profile'}</h2>
                <p className="text-[#A8B8CC] mb-4">{profile.email}</p>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#FBC888] hover:bg-[#FBC888]/90 text-[#002B5C] font-semibold px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-[#6A7B93] border-opacity-20 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-[#1E4C80] bg-opacity-30 border border-[#6A7B93] border-opacity-30 rounded-lg text-[#6A7B93] px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                  placeholder="City, State"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Professional Summary</label>
                <textarea
                  value={profile.professional_summary || ''}
                  onChange={(e) => setProfile({ ...profile, professional_summary: e.target.value })}
                  rows={4}
                  className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                  placeholder="Brief summary of your professional background and skills..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#003A6E] bg-opacity-50 backdrop-blur-lg border border-[#6A7B93] border-opacity-20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Briefcase size={24} className="text-[#FBC888]" />
                Work Experience
              </h2>
              <button
                onClick={addWorkExperience}
                className="flex items-center gap-2 bg-[#1E4C80] hover:bg-[#2A4F7A] text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Plus size={18} />
                <span>Add Experience</span>
              </button>
            </div>
            <div className="space-y-6">
              {workExperiences.map((exp) => (
                <div key={exp.id} className="bg-[#1E4C80] bg-opacity-40 border border-[#6A7B93] border-opacity-20 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Job Title</label>
                      <input
                        type="text"
                        value={exp.job_title}
                        onChange={(e) => updateWorkExperience(exp.id, 'job_title', e.target.value)}
                        className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Company Name</label>
                      <input
                        type="text"
                        value={exp.company_name}
                        onChange={(e) => updateWorkExperience(exp.id, 'company_name', e.target.value)}
                        className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => updateWorkExperience(exp.id, 'location', e.target.value)}
                        className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Start Date</label>
                      <input
                        type="date"
                        value={exp.start_date}
                        onChange={(e) => updateWorkExperience(exp.id, 'start_date', e.target.value)}
                        className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A8B8CC] mb-2">End Date</label>
                      <input
                        type="date"
                        value={exp.end_date || ''}
                        onChange={(e) => updateWorkExperience(exp.id, 'end_date', e.target.value)}
                        disabled={exp.is_current}
                        className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBC888] disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <input
                        type="checkbox"
                        checked={exp.is_current}
                        onChange={(e) => updateWorkExperience(exp.id, 'is_current', e.target.checked)}
                        className="w-5 h-5 rounded border-[#6A7B93] text-[#FBC888] focus:ring-[#FBC888]"
                      />
                      <label className="text-[#A8B8CC]">Current Position</label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#A8B8CC] mb-2">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                      placeholder="Key responsibilities and achievements..."
                    />
                  </div>
                  <button
                    onClick={() => deleteWorkExperience(exp.id)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <Trash2 size={16} />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
              {workExperiences.length === 0 && (
                <p className="text-center text-[#A8B8CC] py-8">No work experience added yet. Click "Add Experience" to get started.</p>
              )}
            </div>
          </div>

          <div className="bg-[#003A6E] bg-opacity-50 backdrop-blur-lg border border-[#6A7B93] border-opacity-20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Skills</h2>
              <button
                onClick={addSkill}
                className="flex items-center gap-2 bg-[#1E4C80] hover:bg-[#2A4F7A] text-white px-4 py-2 rounded-lg transition-all duration-200"
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
                    onChange={(e) => updateSkill(skill.id, 'skill_name', e.target.value)}
                    className="flex-1 bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                  />
                  <select
                    value={skill.proficiency_level}
                    onChange={(e) => updateSkill(skill.id, 'proficiency_level', e.target.value)}
                    className="bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
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

          <div className="bg-[#003A6E] bg-opacity-50 backdrop-blur-lg border border-[#6A7B93] border-opacity-20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Certifications</h2>
              <button
                onClick={addCertification}
                className="flex items-center gap-2 bg-[#1E4C80] hover:bg-[#2A4F7A] text-white px-4 py-2 rounded-lg transition-all duration-200"
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
                    onChange={(e) => updateCertification(cert.id, 'certification_name', e.target.value)}
                    className="flex-1 bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
                    placeholder="Certification Name"
                  />
                  <input
                    type="text"
                    value={cert.issuing_organization}
                    onChange={(e) => updateCertification(cert.id, 'issuing_organization', e.target.value)}
                    className="flex-1 bg-[#1E4C80] bg-opacity-60 border border-[#6A7B93] border-opacity-30 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FBC888]"
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
