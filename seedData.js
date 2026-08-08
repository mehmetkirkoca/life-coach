/**
 * Initial seed data, fallback datasets, and seed function for MongoDB & MCP server
 */
import fs from 'fs';

export const initialUsers = [
  { _id: 'coach_1', name: 'Ahmet Yılmaz', email: 'ahmet@lifecoach.com', roles: ['coach', 'client'], coachId: null, avatarColor: '#ec4899' },
  { _id: 'coach_2', name: 'Zeynep Kaya', email: 'zeynep@lifecoach.com', roles: ['coach', 'client'], coachId: 'coach_1', avatarColor: '#8b5cf6' },
  { _id: 'client_1', name: 'Mustafa Demir', email: 'mustafa@example.com', roles: ['client'], coachId: 'coach_1', avatarColor: '#6366f1' },
  { _id: 'client_2', name: 'Ayşe Yılmaz', email: 'ayse@example.com', roles: ['client'], coachId: 'coach_1', avatarColor: '#10b981' },
  { _id: 'client_3', name: 'Can Tekin', email: 'can@example.com', roles: ['client'], coachId: 'coach_2', avatarColor: '#f59e0b' }
];

export const initialSessionNotes = [
  {
    id: 'note_1',
    clientId: 'client_1',
    coachId: 'coach_1',
    title: 'İlk Tanışma ve Hedef Belirleme Görüşmesi',
    content: 'Danışan ile Denge Çarkı puanları üzerinden kariyer ve finansal hedefler değerlendirildi. SaaS projesi için haftalık 4 saat ayırma kararı alındı.',
    date: '05.08.2026',
    actionItems: ['Haftalık çalışma takvimi hazırlamak', 'SaaS MVP abonelik modülünü tamamlamak'],
    tags: ['Kariyer', 'SaaS', 'Zaman Yönetimi']
  },
  {
    id: 'note_2',
    clientId: 'client_1',
    coachId: 'coach_1',
    title: 'DISC Kişilik Rengi Değerlendirmesi',
    content: 'Danışanın Kırmızı (%27.5) ve Sarı (%26.9) renkleri baskın çıktı. Sonuç odaklılığı yüksek fakat zaman zaman detaylarda sabırsızlanabiliyor.',
    date: '06.08.2026',
    actionItems: ['Detay gerektiren işlerde Mavi renk disiplinini esnetmeden uygulamak'],
    tags: ['DISC Testi', 'Kişilik Analizi']
  }
];

export const defaultClientsMock = [
  { _id: 'client_1', name: 'Mustafa Demir', email: 'mustafa@example.com', role: 'client', avatarColor: '#6366f1' },
  { _id: 'client_2', name: 'Ayşe Yılmaz', email: 'ayse@example.com', role: 'client', avatarColor: '#10b981' },
  { _id: 'client_3', name: 'Can Tekin', email: 'can@example.com', role: 'client', avatarColor: '#f59e0b' }
];

export const initialCoachFeedbacks = [
  {
    id: 'feedback_1',
    clientId: 'client_1',
    coachId: 'coach_1',
    clientName: 'Mustafa Demir',
    rating: 5,
    categories: {
      communication: 5,
      guidance: 5,
      motivation: 5
    },
    title: 'Harika bir seans deneyimi ve net yol haritası',
    comment: 'Ahmet Bey ile yaptığımız seanslarda KAMÇI modeli ve DISC kişilik rengi analizim sayesinde kariyer hedeflerimi çok daha net görmeye başladım. İletişimi ve yapıcı rehberliği mükemmel.',
    date: '07.08.2026'
  }
];

export async function seedInitialData(models, STATE_FILE) {
  const { User, CoachingState, SessionNote, CoachFeedback } = models;
  try {
    // Re-seed users to ensure updated roles and 1-to-N coach mapping
    await User.deleteMany({});
    await User.create(initialUsers);
    console.log('[MongoDB] Seeded Coach and Client users with multi-role and 1-to-N relationships.');

    const stateCount = await CoachingState.countDocuments();
    if (stateCount === 0 && STATE_FILE && fs.existsSync(STATE_FILE)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        await CoachingState.create({
          userId: 'client_1',
          locale: fileContent.locale || 'tr',
          ratings: fileContent.ratings || {},
          values: fileContent.values || [],
          plans: fileContent.plans || [],
          colorAnswers: fileContent.colorAnswers || {}
        });
        console.log('[MongoDB] Seeded client_1 state from coaching_state.json');
      } catch (e) {
        console.error('[MongoDB] Error reading coaching_state.json for seed:', e);
      }
    }

    const noteCount = await SessionNote.countDocuments();
    if (noteCount === 0) {
      await SessionNote.create(initialSessionNotes);
      console.log('[MongoDB] Seeded initial session notes.');
    }

    if (CoachFeedback) {
      const feedbackCount = await CoachFeedback.countDocuments();
      if (feedbackCount === 0) {
        await CoachFeedback.create(initialCoachFeedbacks);
        console.log('[MongoDB] Seeded initial coach feedbacks.');
      }
    }
  } catch (err) {
    console.error('[MongoDB] Seed error:', err);
  }
}
