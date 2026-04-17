'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, Briefcase, Code, ExternalLink, FileText, Plus, RefreshCcw, Trash2, Upload } from 'lucide-react';
import { authManager, makeAuthenticatedRequest } from '@/lib/utils/clientAuth';
import toast from 'react-hot-toast';

type ApiResponse<T> = { success: boolean; message?: string; data: T };

type VaultData = {
  _id: string;
  resumes: Array<{ _id: string; url: string; fileName: string; type: string; uploadedAt: string }>;
  certificates: Array<{ _id: string; url: string; fileName: string; category: string; title: string; uploadedAt: string }>;
  internships: Array<{
    _id: string;
    company: string;
    role: string;
    duration: string;
    startDate: string;
    endDate: string;
    stipend?: number;
    certificateUrl?: string;
    description: string;
  }>;
  projects: Array<{
    _id: string;
    title: string;
    description: string;
    techStack: string[];
    githubUrl?: string;
    demoUrl?: string;
  }>;
  skills: Array<{ _id: string; name: string; proficiency: 'beginner' | 'intermediate' | 'advanced' }>;
  extraFields: Record<string, unknown>;
  completenessScore: number;
};

const EMPTY_VAULT: VaultData = {
  _id: '',
  resumes: [],
  certificates: [],
  internships: [],
  projects: [],
  skills: [],
  extraFields: {},
  completenessScore: 0,
};

export default function VaultPage() {
  const router = useRouter();
  const [vault, setVault] = useState<VaultData>(EMPTY_VAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInternshipModal, setShowInternshipModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Form states
  const [certificateForm, setCertificateForm] = useState({
    file: null as File | null,
    title: '',
    category: 'technical'
  });
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    demoUrl: ''
  });
  const [internshipForm, setInternshipForm] = useState({
    company: '',
    role: '',
    duration: '',
    description: '',
    startDate: '',
    endDate: '',
    stipend: ''
  });
  const [skillForm, setSkillForm] = useState({
    name: '',
    proficiency: 'intermediate' as 'beginner' | 'intermediate' | 'advanced'
  });

  const stats = useMemo(
    () => [
      { label: 'Resumes', value: vault.resumes.length },
      { label: 'Certificates', value: vault.certificates.length },
      { label: 'Projects', value: vault.projects.length },
      { label: 'Internships', value: vault.internships.length },
      { label: 'Skills', value: vault.skills.length },
    ],
    [vault]
  );

  useEffect(() => {
    // Check authentication
    if (!authManager.isAuthenticated()) {
      toast.error('Please sign in to access your vault');
      window.location.href = '/sign-in';
      return;
    }
    // User is authenticated, fetch vault data
    fetchVault();
  }, []);

  const fetchVault = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await makeAuthenticatedRequest('/api/vault', { 
        cache: 'no-store'
      });
      const payload: ApiResponse<VaultData> = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to load vault');
      }
      setVault(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const updateWithApi = async (url: string, options: RequestInit) => {
    setSaving(true);
    try {
      const response = await makeAuthenticatedRequest(url, options);
      const payload: ApiResponse<VaultData> = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Request failed');
      }
      setVault(payload.data);
      setError('');
      toast.success('Updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const onResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'General');
    await updateWithApi('/api/vault/resume', { method: 'POST', body: formData });
    event.target.value = '';
  };

  const onCertificateUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCertificateForm({ ...certificateForm, file, title: file.name.split('.')[0] || 'Certificate' });
    setShowCertificateModal(true);
    event.target.value = '';
  };

  const handleCertificateSubmit = async () => {
    if (!certificateForm.file || !certificateForm.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('file', certificateForm.file);
    formData.append('title', certificateForm.title);
    formData.append('category', certificateForm.category);
    
    await updateWithApi('/api/vault/certificate', { method: 'POST', body: formData });
    setShowCertificateModal(false);
    setCertificateForm({ file: null, title: '', category: 'technical' });
  };

  const addProject = async () => {
    setShowProjectModal(true);
  };

  const handleProjectSubmit = async () => {
    if (!projectForm.title || !projectForm.description) {
      toast.error('Please fill in title and description');
      return;
    }

    await updateWithApi('/api/vault/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: projectForm.title,
        description: projectForm.description,
        techStack: projectForm.techStack ? projectForm.techStack.split(',').map((item) => item.trim()).filter(Boolean) : [],
        githubUrl: projectForm.githubUrl || undefined,
        demoUrl: projectForm.demoUrl || undefined,
      }),
    });
    setShowProjectModal(false);
    setProjectForm({ title: '', description: '', techStack: '', githubUrl: '', demoUrl: '' });
  };

  const addInternship = async () => {
    setShowInternshipModal(true);
  };

  const handleInternshipSubmit = async () => {
    if (!internshipForm.company || !internshipForm.role || !internshipForm.duration || !internshipForm.description || !internshipForm.startDate || !internshipForm.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    await updateWithApi('/api/vault/internship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: internshipForm.company,
        role: internshipForm.role,
        duration: internshipForm.duration,
        description: internshipForm.description,
        startDate: internshipForm.startDate,
        endDate: internshipForm.endDate,
        stipend: internshipForm.stipend ? Number(internshipForm.stipend) : undefined,
      }),
    });
    setShowInternshipModal(false);
    setInternshipForm({ company: '', role: '', duration: '', description: '', startDate: '', endDate: '', stipend: '' });
  };

  const addSkill = async () => {
    setShowSkillModal(true);
  };

  const handleSkillSubmit = async () => {
    if (!skillForm.name) {
      toast.error('Please enter a skill name');
      return;
    }

    await updateWithApi('/api/vault/skills', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills: [...vault.skills.map(({ name: skillName, proficiency: level }) => ({ name: skillName, proficiency: level })), { name: skillForm.name, proficiency: skillForm.proficiency }],
      }),
    });
    setShowSkillModal(false);
    setSkillForm({ name: '', proficiency: 'intermediate' });
  };

  const removeItem = async (type: 'resume' | 'certificate' | 'project' | 'internship', id: string) => {
    const confirmed = window.confirm('Delete this item from your vault?');
    if (!confirmed) return;
    await updateWithApi(`/api/vault/${type}?id=${id}`, { method: 'DELETE' });
  };

  const missingBadges = [
    { label: 'Resume', done: vault.resumes.length > 0 },
    { label: 'Certificates', done: vault.certificates.length > 0 },
    { label: 'Projects', done: vault.projects.length > 0 },
    { label: 'Internships', done: vault.internships.length > 0 },
    { label: 'Skills', done: vault.skills.length > 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Vault</h1>
            <p className="mt-1 text-sm text-slate-600">Real-time portfolio data synced with your application profile.</p>
          </div>
          <Button variant="outline" onClick={fetchVault} disabled={loading || saving}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <Card className="mb-6 border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-600">Profile Completeness</p>
              <p className="text-4xl font-semibold text-slate-900">{vault.completenessScore}%</p>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${vault.completenessScore}%` }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {missingBadges.map((item) => (
                  <Badge key={item.label} className={item.done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                    {item.done ? `${item.label} added` : `Add ${item.label}`}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {loading ? (
          <Card className="border-slate-200 p-8 text-center text-slate-600">Loading your vault...</Card>
        ) : (
          <div className="w-full space-y-6">
            <Tabs defaultValue="resumes" className="w-full">
              <div className="w-full mb-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="resumes">Resumes</TabsTrigger>
                  <TabsTrigger value="certificates">Certificates</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="internships">Internships</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>
              </div>

              <div className="w-full">
                <TabsContent value="resumes" className="mt-0">
                  <div className="w-full">
                    <Card className="space-y-3 border-slate-200 bg-white p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Resumes</h2>
                        <label>
                          <input type="file" accept="application/pdf" className="hidden" onChange={onResumeUpload} />
                          <Button asChild size="sm" disabled={saving}>
                            <span><Upload className="mr-2 h-4 w-4" /> Upload Resume</span>
                          </Button>
                        </label>
                      </div>
                      {vault.resumes.length === 0 ? (
                        <p className="text-sm text-slate-500">No resumes uploaded yet.</p>
                      ) : (
                        vault.resumes.map((resume) => (
                          <div key={resume._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-slate-900">{resume.fileName}</p>
                                <p className="text-xs text-slate-500">{resume.type} • {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a href={resume.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">Open</Button>
                              </a>
                              <Button variant="ghost" size="icon" onClick={() => removeItem('resume', resume._id)} disabled={saving}>
                                <Trash2 className="h-4 w-4 text-rose-600" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="certificates" className="mt-0">
                  <div className="w-full">
                    <Card className="space-y-3 border-slate-200 bg-white p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Certificates</h2>
                        <label>
                          <input type="file" accept=".pdf,image/*" className="hidden" onChange={onCertificateUpload} />
                          <Button asChild size="sm" disabled={saving}>
                            <span><Upload className="mr-2 h-4 w-4" /> Add Certificate</span>
                          </Button>
                        </label>
                      </div>
                      {vault.certificates.length === 0 ? (
                        <p className="text-sm text-slate-500">No certificates yet.</p>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                          {vault.certificates.map((cert) => (
                            <div key={cert._id} className="rounded-xl border border-slate-200 p-4">
                              <div className="mb-2 flex items-start justify-between">
                                <Award className="h-5 w-5 text-violet-600" />
                                <Badge>{cert.category}</Badge>
                              </div>
                              <p className="font-medium text-slate-900">{cert.title}</p>
                              <p className="text-xs text-slate-500">{new Date(cert.uploadedAt).toLocaleDateString()}</p>
                              <div className="mt-3 flex items-center gap-2">
                                <a href={cert.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm">Open</Button>
                                </a>
                                <Button variant="ghost" size="icon" onClick={() => removeItem('certificate', cert._id)} disabled={saving}>
                                  <Trash2 className="h-4 w-4 text-rose-600" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="mt-0">
                  <div className="w-full">
                    <Card className="space-y-3 border-slate-200 bg-white p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
                        <Button size="sm" onClick={addProject} disabled={saving}>
                          <Plus className="mr-2 h-4 w-4" /> Add Project
                        </Button>
                      </div>
                      {vault.projects.length === 0 ? (
                        <p className="text-sm text-slate-500">No projects yet.</p>
                      ) : (
                        vault.projects.map((project) => (
                          <div key={project._id} className="rounded-xl border border-slate-200 p-4">
                            <div className="mb-2 flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Code className="h-5 w-5 text-emerald-600" />
                                <p className="font-medium text-slate-900">{project.title}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeItem('project', project._id)} disabled={saving}>
                                <Trash2 className="h-4 w-4 text-rose-600" />
                              </Button>
                            </div>
                            <p className="text-sm text-slate-600">{project.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {project.techStack.map((tech) => (
                                <Badge key={tech} variant="outline">{tech}</Badge>
                              ))}
                            </div>
                            <div className="mt-3 flex gap-2">
                              {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm"><ExternalLink className="mr-2 h-4 w-4" />GitHub</Button>
                                </a>
                              )}
                              {project.demoUrl && (
                                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm"><ExternalLink className="mr-2 h-4 w-4" />Live Demo</Button>
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="internships" className="mt-0">
                  <div className="w-full">
                    <Card className="space-y-3 border-slate-200 bg-white p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Internships</h2>
                        <Button size="sm" onClick={addInternship} disabled={saving}>
                          <Plus className="mr-2 h-4 w-4" /> Add Internship
                        </Button>
                      </div>
                      {vault.internships.length === 0 ? (
                        <p className="text-sm text-slate-500">No internships added yet.</p>
                      ) : (
                        vault.internships.map((internship) => (
                          <div key={internship._id} className="rounded-xl border border-slate-200 p-4">
                            <div className="mb-2 flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-amber-600" />
                                <p className="font-medium text-slate-900">{internship.company} - {internship.role}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeItem('internship', internship._id)} disabled={saving}>
                                <Trash2 className="h-4 w-4 text-rose-600" />
                              </Button>
                            </div>
                            <p className="text-sm text-slate-600">{internship.description}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()} • {internship.duration}
                            </p>
                          </div>
                        ))
                      )}
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="mt-0">
                  <div className="w-full">
                    <Card className="space-y-3 border-slate-200 bg-white p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
                        <Button size="sm" onClick={addSkill} disabled={saving}>
                          <Plus className="mr-2 h-4 w-4" /> Add Skill
                        </Button>
                      </div>
                      {vault.skills.length === 0 ? (
                        <p className="text-sm text-slate-500">No skills added yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {vault.skills.map((skill) => (
                            <Badge key={skill._id} variant="outline" className="px-3 py-1.5">
                              {skill.name} • {skill.proficiency}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certificate</DialogTitle>
            <DialogClose onClose={() => setShowCertificateModal(false)} />
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cert-title">Certificate Title *</Label>
              <Input
                id="cert-title"
                value={certificateForm.title}
                onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })}
                placeholder="Enter certificate title"
              />
            </div>
            <div>
              <Label htmlFor="cert-category">Category *</Label>
              <select 
                id="cert-category"
                value={certificateForm.category} 
                onChange={(e) => setCertificateForm({ ...certificateForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="technical">Technical</option>
                <option value="soft skills">Soft Skills</option>
                <option value="NPTEL">NPTEL</option>
                <option value="coursera">Coursera</option>
                <option value="other">Other</option>
              </select>
            </div>
            {certificateForm.file && (
              <div className="text-sm text-slate-600">
                Selected file: {certificateForm.file.name}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCertificateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCertificateSubmit} disabled={saving}>
              Add Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Modal */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project</DialogTitle>
            <DialogClose onClose={() => setShowProjectModal(false)} />
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-title">Project Title *</Label>
              <Input
                id="project-title"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                placeholder="Enter project title"
              />
            </div>
            <div>
              <Label htmlFor="project-description">Description *</Label>
              <Input
                id="project-description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Enter project description"
              />
            </div>
            <div>
              <Label htmlFor="project-tech">Tech Stack</Label>
              <Input
                id="project-tech"
                value={projectForm.techStack}
                onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                placeholder="React, Node.js, MongoDB (comma separated)"
              />
            </div>
            <div>
              <Label htmlFor="project-github">GitHub URL</Label>
              <Input
                id="project-github"
                value={projectForm.githubUrl}
                onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                placeholder="https://github.com/username/repo"
              />
            </div>
            <div>
              <Label htmlFor="project-demo">Live Demo URL</Label>
              <Input
                id="project-demo"
                value={projectForm.demoUrl}
                onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                placeholder="https://your-project.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleProjectSubmit} disabled={saving}>
              Add Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Internship Modal */}
      <Dialog open={showInternshipModal} onOpenChange={setShowInternshipModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Internship</DialogTitle>
            <DialogClose onClose={() => setShowInternshipModal(false)} />
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="internship-company">Company Name *</Label>
              <Input
                id="internship-company"
                value={internshipForm.company}
                onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="internship-role">Role *</Label>
              <Input
                id="internship-role"
                value={internshipForm.role}
                onChange={(e) => setInternshipForm({ ...internshipForm, role: e.target.value })}
                placeholder="Enter your role"
              />
            </div>
            <div>
              <Label htmlFor="internship-duration">Duration *</Label>
              <Input
                id="internship-duration"
                value={internshipForm.duration}
                onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                placeholder="e.g., 3 months"
              />
            </div>
            <div>
              <Label htmlFor="internship-description">Description *</Label>
              <Input
                id="internship-description"
                value={internshipForm.description}
                onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                placeholder="Describe your work and achievements"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="internship-start">Start Date *</Label>
                <Input
                  id="internship-start"
                  type="date"
                  value={internshipForm.startDate}
                  onChange={(e) => setInternshipForm({ ...internshipForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="internship-end">End Date *</Label>
                <Input
                  id="internship-end"
                  type="date"
                  value={internshipForm.endDate}
                  onChange={(e) => setInternshipForm({ ...internshipForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="internship-stipend">Stipend (Optional)</Label>
              <Input
                id="internship-stipend"
                type="number"
                value={internshipForm.stipend}
                onChange={(e) => setInternshipForm({ ...internshipForm, stipend: e.target.value })}
                placeholder="Enter stipend amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInternshipModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInternshipSubmit} disabled={saving}>
              Add Internship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Modal */}
      <Dialog open={showSkillModal} onOpenChange={setShowSkillModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
            <DialogClose onClose={() => setShowSkillModal(false)} />
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                id="skill-name"
                value={skillForm.name}
                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                placeholder="e.g., JavaScript, Python, React"
              />
            </div>
            <div>
              <Label htmlFor="skill-proficiency">Proficiency Level *</Label>
              <select 
                id="skill-proficiency"
                value={skillForm.proficiency} 
                onChange={(e) => setSkillForm({ ...skillForm, proficiency: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkillModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSkillSubmit} disabled={saving}>
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
