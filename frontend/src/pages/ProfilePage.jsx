import { useEffect, useState } from 'react'
import { getFullProfile } from '../api/profile'
import useProfileStore from '../store/profileStore'
import PersonalInfoForm from '../components/profile/PersonalInfoForm'
import WorkExperienceForm from '../components/profile/WorkExperienceForm'
import EducationForm from '../components/profile/EducationForm'
import SkillsForm from '../components/profile/SkillsForm'
import ProjectsForm from '../components/profile/ProjectsForm'
import CertificationsForm from '../components/profile/CertificationsForm'

function Section({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={styles.section}>
      <button style={styles.sectionHeader} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={styles.sectionBody}>{children}</div>}
    </div>
  )
}

export default function ProfilePage() {
  const { profile, setProfile, setLoading } = useProfileStore()
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getFullProfile()
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [])

  if (fetching) return <div style={{ padding: 40 }}>Loading profile...</div>

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Profile</h2>
      <p style={styles.subtitle}>Fill in your information. This is what the AI uses to generate your CVs.</p>

      <Section title="Personal Information">
        <PersonalInfoForm data={profile?.personal} />
      </Section>

      <Section title="Work Experience">
        <WorkExperienceForm data={profile?.experience} />
      </Section>

      <Section title="Education">
        <EducationForm data={profile?.education} />
      </Section>

      <Section title="Skills">
        <SkillsForm data={profile?.skills} />
      </Section>

      <Section title="Projects">
        <ProjectsForm data={profile?.projects} />
      </Section>

      <Section title="Certifications">
        <CertificationsForm data={profile?.certifications} />
      </Section>
    </div>
  )
}

const styles = {
  container: { padding: '24px', maxWidth: '860px', margin: '0 auto' },
  title: { fontSize: '24px', marginBottom: '4px' },
  subtitle: { color: '#666', fontSize: '14px', marginBottom: '24px' },
  section: { marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' },
  sectionHeader: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
  sectionBody: { padding: '20px' },
}