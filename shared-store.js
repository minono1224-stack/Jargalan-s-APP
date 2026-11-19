// shared-store.js — Бүх самбарыг холбох нэгдсэн өгөгдлийн сан (localStorage + real-time sync)
const STORE_KEY = 'chandmani_sob_shared_v1';

const defaultStore = {
  // 1. Хүүхдүүд & Ирц (Багш -> Тогооч, Нярав, Эцэг эх, Ажиглалт)
  children: [
    {
      id: 101,
      name: 'Тэмүүлэн Батбаяр',
      group: 'Пороро бүлэг',
      age: 5,
      regNo: 'УД19253412',
      parent: 'Батбаяр (99112233)',
      attendance: 'Ирсэн', // 'Ирсэн' | 'Өвчтэй' | 'Чөлөөтэй'
      allergies: ['Өндөг', 'Самар'],
      avatar: '🧸'
    },
    {
      id: 102,
      name: 'Амин-Эрдэнэ Номин',
      group: 'Пороро бүлэг',
      age: 4,
      regNo: 'УД20261102',
      parent: 'Номин-Эрдэнэ (99001122)',
      attendance: 'Ирсэн',
      allergies: [],
      avatar: '👧'
    }
  ],

  // 2. Хоолны цэс, 7 хоног, Өдрийн хоол & Санал (Тогооч <-> Эцэг эх)
  meals: [
    {
      id: 1,
      type: 'daily', // 'menu' | 'weekly' | 'daily'
      date: '2026-11-19',
      title: 'Будаатай шөл, котлет, аарцтай цай',
      notes: 'Харшилтай хүүхдэд тусгай орц бэлдэнэ.',
      fileName: '',
      feedbacks: [
        {
          id: 1,
          author: 'Ө.Эрдэнэчимэг (Эмч)',
          comment: 'Өнөөдрийн шөл амин дэм сайтай байна.',
          date: '2026-11-19 10:15'
        }
      ]
    }
  ],

  // 3. Хүнс / Барааны захиалга (Тогооч, Хөгжим/Тамир багш -> Нярав)
  inventoryRequests: [
    {
      id: 1,
      fromRole: 'Тогооч',
      date: '2026-11-19',
      itemsText: 'Мах 15кг, Гурил 10кг, Төмс 20кг',
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      nyravNote: ''
    }
  ],

  // 4. Зөвлөмж & Мэдээлэл (Эрхлэгч/Эмч/Арга зүйч -> Багш, Эцэг эх, Тогооч)
  recommendations: [
    {
      id: 1,
      sender: '🩺 Эмч',
      audience: 'all', // 'all' | 'teachers' | 'parents' | 'private'
      title: 'Өвлийн улиралд анхаарах эрүүл мэндийн зөвлөмж',
      desc: 'Хүүхдийг даархаас сэргийлж дулаан хувцаслаж, витаминтай хоол өгөх.',
      fileName: 'Emchiin_zovlomj.pdf',
      date: '2026-11-19 09:00'
    }
  ],

  // 5. Ажиглалт & Үнэлгээ (Багш / Ажиглалтын самбар <-> Эцэг эх)
  observations: [
    {
      id: 1,
      childId: 101,
      childName: 'Тэмүүлэн Батбаяр',
      group: 'Пороро бүлэг',
      score: '10 оноо (Маш сайн 🌟)',
      category: 'Хэл яриа',
      conclusion: 'Өнөөдөр өглөө тоглоомоо хурааж, бусадтай найрсгаар тоглолоо.',
      shareWithParent: true,
      fileName: '',
      date: '2026-11-19 11:20'
    }
  ],

  // 6. Бүлгийн чат (Багш <-> Эцэг эх)
  chatMessages: [
    {
      id: 1,
      group: 'Пороро бүлэг',
      sender: 'Д.Батбаяр (Багш)',
      role: 'teacher',
      text: 'Сайн байна уу эрхэм эцэг эхчүүдээ! Маргааш биеийн тамирын хувцастай ирээрэй.',
      time: '08:30'
    },
    {
      id: 2,
      group: 'Пороро бүлэг',
      sender: 'Эцэг эх (Тэмүүлэн)',
      role: 'parent',
      text: 'Сайн байна уу багш аа, ойлголоо баярлалаа!',
      time: '08:45'
    }
  ]
};

const SharedStore = {
  get() {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(defaultStore));
      return structuredClone(defaultStore);
    }
    try {
      return JSON.parse(raw);
    } catch {
      return structuredClone(defaultStore);
    }
  },

  set(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    // Ижил таб доторх сонсогчдод мэдэгдэх
    window.dispatchEvent(new CustomEvent('shared-store-updated', { detail: data }));
  },

  update(updaterFn) {
    const current = this.get();
    updaterFn(current);
    this.set(current);
    return current;
  },

  onChange(callback) {
    // Өөр таб/цонх дээр өгөгдөл өөрчлөгдөхөд
    window.addEventListener('storage', (e) => {
      if (e.key === STORE_KEY && e.newValue) {
        callback(JSON.parse(e.newValue));
      }
    });
    // Ижил хуудсан дээр өөрчлөгдөхөд
    window.addEventListener('shared-store-updated', (e) => {
      callback(e.detail);
    });
  }
};

function nowFormatted() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}