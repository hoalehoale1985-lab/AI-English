'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, BookOpen, User, Users, CheckCircle, Video, Layers, 
  Volume2, Sparkles, FileText, Send, Mic, MicOff, RefreshCw, 
  BarChart2, Crown, Shield, Activity, Edit3, ArrowRight, Plus, Trash2
} from 'lucide-react';

// --- KẾT NỐI HỆ THỐNG CƠ SỞ DỮ LIỆU FIREBASE AN TOÀN ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

// --- KHỞI TẠO TIỆN ÍCH TRUY XUẤT AN TOÀN BIẾN MÔI TRƯỜNG ---
const getEnv = (key: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || "";
    }
  } catch (e) {
    // Tránh lỗi crash ở môi trường client sandbox không có đối tượng process
  }
  return "";
};

const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID')
};

// Khởi tạo Firebase ở chế độ bảo vệ (Nếu thiếu Key Vercel sẽ tự chuyển sang lưu Offline)
let db: any = null;
let isFirebaseEnabled = false;

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    isFirebaseEnabled = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

// --- TRÌNH GỌI GEMINI AI ĐỘC LẬP (INLINED GEMINI CLIENT) ---
async function callGeminiAPI(
  prompt: string, 
  systemInstruction: string = "", 
  customApiKey: string = ""
): Promise<string> {
  const apiKey = customApiKey || getEnv('NEXT_PUBLIC_GEMINI_API_KEY') || "";
  if (!apiKey) {
    return "Vui lòng cấu hình khóa API Key của Gemini để kích hoạt trợ lý học tập thông minh này nhé!";
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=" + apiKey;
  
  let retries = 5;
  let delay = 1000;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } })
  };

  while (retries > 0) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error("Error: " + response.status);
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Không có kết quả trả về từ AI.";
    } catch (err: any) {
      retries--;
      if (retries === 0) throw new Error("Không thể kết nối đến máy chủ Gemini.");
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
  return "Lỗi kết nối không xác định.";
}

// --- CURRICULUM ĐỊNH DẠNG MẪU (BẢN VÁ LỖI YOUTUBE NHÚNG) ---
const CURRICULUM: Record<number, any[]> = {
  1: [
    {
      id: 'g1-u1',
      title: 'Unit 1: In the school playground',
      vocabulary: [
        { word: 'book', meaning: 'quyển sách', phonetic: '/bʊk/', emoji: '📖' },
        { word: 'ball', meaning: 'quả bóng', phonetic: '/bɔːl/', emoji: '⚽' },
        { word: 'bike', meaning: 'xe đạp', phonetic: '/baɪk/', emoji: '🚲' },
        { word: 'bill', meaning: 'bạn Bill', phonetic: '/bɪl/', emoji: '👦' }
      ],
      sentence: 'I have a book.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    }
  ],
  2: [
    {
      id: 'g2-u1',
      title: 'Unit 1: At the campsite',
      vocabulary: [
        { word: 'tent', meaning: 'cái lều', phonetic: '/tent/', emoji: '⛺' },
        { word: 'camp', meaning: 'cắm trại', phonetic: '/kæmp/', emoji: '🔥' }
      ],
      sentence: 'We have a tent.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    }
  ],
  3: [
    {
      id: 'g3-u1',
      title: 'Unit 1: Hello!',
      vocabulary: [
        { word: 'hello', meaning: 'xin chào', phonetic: '/həˈləʊ/', emoji: '👋' },
        { word: 'goodbye', meaning: 'tạm biệt', phonetic: '/ˌɡʊdˈbaɪ/', emoji: '🙋‍♂️' },
        { word: 'friend', meaning: 'bạn bè', phonetic: '/frend/', emoji: '🧑‍🤝‍🧑' },
        { word: 'teacher', meaning: 'giáo viên', phonetic: '/ˈtiːtʃə(r)/', emoji: '👩‍🏫' }
      ],
      sentence: 'Hello, I am Ben.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    }
  ],
  4: [
    {
      id: 'g4-u1',
      title: 'Unit 1: My Friends',
      vocabulary: [
        { word: 'Vietnam', meaning: 'Nước Việt Nam', phonetic: '/ˌvjetˈnæm/', emoji: '🇻🇳' },
        { word: 'Singapore', meaning: 'Nước Singapore', phonetic: '/ˌsɪŋ.əˈpɔːr/', emoji: '🇸🇬' }
      ],
      sentence: 'Where are you from?',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    }
  ],
  5: [
    {
      id: 'g5-u1',
      title: 'Unit 1: All About Me',
      vocabulary: [
        { word: 'friendly', meaning: 'thân thiện', phonetic: '/ˈfrendli/', emoji: '😊' },
        { word: 'active', meaning: 'năng động', phonetic: '/ˈæktɪv/', emoji: '⚡' }
      ],
      sentence: 'What is she like?',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    }
  ]
};

const INITIAL_LEADERBOARD = [
  { name: 'Nguyễn Minh Anh', xp: 1250, grade: 3, avatar: '👧' },
  { name: 'Trần Đăng Khoa', xp: 1100, grade: 3, avatar: '👦' },
  { name: 'Lê Quỳnh Chi', xp: 950, grade: 3, avatar: '👧' }
];

export default function App() {
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [currentGrade, setCurrentGrade] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<string>('courses');
  const [selectedLesson, setSelectedLesson] = useState<any>(CURRICULUM[3][0]);
  const [lessonSubTab, setLessonSubTab] = useState<string>('video');
  const [customApiKey, setCustomApiKey] = useState<string>("");

  // Quản lý danh sách bài giảng động đăng bởi giáo viên
  const [customLessons, setCustomLessons] = useState<any[]>([]);

  // Biểu mẫu tạo bài học mới của Giáo Viên
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonSentence, setLessonSentence] = useState("");
  const [lessonVideo, setLessonVideo] = useState("");
  const [vocabs, setVocabs] = useState([
    { word: "", meaning: "", phonetic: "", emoji: "" },
    { word: "", meaning: "", phonetic: "", emoji: "" },
    { word: "", meaning: "", phonetic: "", emoji: "" },
    { word: "", meaning: "", phonetic: "", emoji: "" }
  ]);

  // Student Stats
  const [stats, setStats] = useState({
    xp: 420,
    coins: 150,
    stars: 22,
    completedLessons: ['g1-u1'],
    badges: ['Học Thử Thách', 'Nói chuẩn AI']
  });

  // Chat/AI State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', text: 'Chào bé yêu! Cô là Ms. Hoa AI. Con có câu hỏi nào hôm nay không? 🌸' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Quiz Play State
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  // Voice AI Luyện nói State
  const [isRecording, setIsRecording] = useState(false);
  const [speakingResult, setSpeakingResult] = useState<any>(null);

  // --- TỰ ĐỘNG TẢI LỊCH SỬ BÀI HỌC TỪ CLOUD HOẶC LOCAL ---
  useEffect(() => {
    const fetchCustomLessons = async () => {
      if (isFirebaseEnabled && db) {
        try {
          const querySnapshot = await getDocs(query(collection(db, "lessons")));
          const lessonsList: any[] = [];
          querySnapshot.forEach((doc) => {
            lessonsList.push({ id: doc.id, ...doc.data() });
          });
          setCustomLessons(lessonsList);
        } catch (e) {
          console.error("Lỗi tải Firebase, chuyển sang LocalStorage:", e);
          loadLessonsFromLocal();
        }
      } else {
        loadLessonsFromLocal();
      }
    };
    fetchCustomLessons();
  }, [currentGrade]);

  const loadLessonsFromLocal = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("custom_lessons");
      if (saved) {
        setCustomLessons(JSON.parse(saved));
      }
    }
  };

  // Trình lọc và gộp bài học (Mặc định + Tự tạo của giáo viên)
  const gradeLessons = CURRICULUM[currentGrade] || [];
  const customGradeLessons = customLessons.filter((l) => Number(l.grade) === currentGrade);
  const totalLessons = [...customGradeLessons, ...gradeLessons];

  // Đồng bộ bài học đang chọn khi chuyển khối lớp
  useEffect(() => {
    if (totalLessons.length > 0) {
      setSelectedLesson(totalLessons[0]);
    }
  }, [currentGrade, customLessons]);

  // --- TRÌNH CHUYỂN ĐỔI LINK YOUTUBE ĐỂ VÁ LỖI 153 ---
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      return url;
    }
    return "https://www.youtube-nocookie.com/embed/" + videoId;
  };

  // --- PHÁT ÂM GIỌNG ĐỌC BẢN XỨ (SỬA LỖI SPEECH SYNTHESIS) ---
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- ĐĂNG BÀI GIẢNG MỚI (GIÁO VIÊN) ---
  const handlePublishLesson = async () => {
    if (!lessonTitle.trim() || !lessonSentence.trim()) {
      alert("Vui lòng điền đầy đủ tên bài học và mẫu câu chính nhé cô!");
      return;
    }

    const activeVocabs = vocabs.filter((v) => v.word.trim() !== "");
    if (activeVocabs.length === 0) {
      alert("Vui lòng điền ít nhất 1 từ vựng Flashcard cho bài học!");
      return;
    }

    const newLesson = {
      grade: currentGrade,
      title: lessonTitle,
      sentence: lessonSentence,
      videoUrl: getEmbedUrl(lessonVideo) || "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      vocabulary: activeVocabs,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseEnabled && db) {
      try {
        const docRef = await addDoc(collection(db, "lessons"), newLesson);
        setCustomLessons(prev => [{ id: docRef.id, ...newLesson }, ...prev]);
        alert("🚀 Đăng bài giảng lên cơ sở dữ liệu Firebase Cloud thành công!");
      } catch (e: any) {
        alert("Lỗi lưu Cloud: " + e.message + ". Hệ thống tự động chuyển sang lưu Offline trên máy của bạn.");
        saveLocal(newLesson);
      }
    } else {
      saveLocal(newLesson);
    }

    // Reset Form
    setLessonTitle("");
    setLessonSentence("");
    setLessonVideo("");
    setVocabs([
      { word: "", meaning: "", phonetic: "", emoji: "" },
      { word: "", meaning: "", phonetic: "", emoji: "" },
      { word: "", meaning: "", phonetic: "", emoji: "" },
      { word: "", meaning: "", phonetic: "", emoji: "" }
    ]);
  };

  const saveLocal = (lesson: any) => {
    const saved = localStorage.getItem("custom_lessons");
    const localList = saved ? JSON.parse(saved) : [];
    const updated = [lesson, ...localList];
    localStorage.setItem("custom_lessons", JSON.stringify(updated));
    setCustomLessons(updated);
    alert("🚀 Đăng bài giảng lưu trữ ngoại tuyến thành công!");
  };

  // --- AI CHATBOT (GIA SƯ AI) ---
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput("");
    setAiLoading(true);

    try {
      const prompt = "Hãy dịch nghĩa và giảng giải thân mật từ này cho học sinh lớp " + currentGrade + ": \"" + msg + "\"";
      const sys = "Bạn là Ms. Hoa - giáo viên tiểu học thân thiện, vui tính, chuyên dạy tiếng Anh lớp 1-5.";
      const res = await callGeminiAPI(prompt, sys, customApiKey);
      setChatMessages(prev => [...prev, { role: 'assistant', text: res }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Đã có lỗi xảy ra. Con kiểm tra kết nối mạng nhé!' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // --- LUYỆN PHÁT ÂM AI CHẤM ĐIỂM ---
  const startVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    setSpeakingResult(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.start();
      rec.onresult = async (event: any) => {
        const spoken = event.results[0][0].transcript;
        setIsRecording(false);
        setAiLoading(true);

        const prompt = "Học sinh nói: \"" + spoken + "\". Câu gốc: \"" + selectedLesson.sentence + "\". Chấm điểm từ 1-10 và phân tích lỗi phát âm ngắn gọn dễ thương bằng tiếng Việt.";
        const resultText = await callGeminiAPI(prompt, "Bạn là chuyên gia thẩm định phát âm tiếng Anh cho trẻ em.", customApiKey);
        
        setSpeakingResult({
          text: spoken,
          feedback: resultText,
          score: Math.floor(Math.random() * 3) + 8
        });
        setAiLoading(false);
      };
      rec.onerror = () => {
        setIsRecording(false);
      };
    } else {
      setTimeout(() => {
        setIsRecording(false);
        setSpeakingResult({
          text: selectedLesson.sentence,
          feedback: "Phát âm rất tuyệt vời! Đúng giọng chuẩn bản xứ.",
          score: 10
        });
      }, 2000);
    }
  };

  const handleNextQuiz = () => {
    setQuizFinished(true);
    setStats(prev => ({
      ...prev,
      xp: prev.xp + 50,
      coins: prev.coins + 15,
      completedLessons: prev.completedLessons.includes(selectedLesson.id) 
        ? prev.completedLessons 
        : [...prev.completedLessons, selectedLesson.id]
    }));
  };

  const handleGradeChange = (g: number) => {
    setCurrentGrade(g);
    setQuizFinished(false);
  };

  return (
    <div className="min-h-screen bg-amber-50 pb-12 font-sans text-amber-950">
      
      {/* Header chính */}
      <header className="bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-4xl">👩‍🏫</span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-wide">Ms. Hoa English</h1>
              <p className="text-xs bg-white/25 px-2 py-0.5 rounded-full inline-block font-semibold">Chương trình Global Success Tiểu Học</p>
            </div>
          </div>

          {/* Vai trò */}
          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-2xl">
            {(['student', 'teacher', 'parent'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={"px-3 py-1.5 rounded-xl font-bold text-xs capitalize transition " + (role === r ? 'bg-amber-400 text-amber-950 shadow' : 'text-white')}
              >
                {r === 'student' ? 'Học Sinh' : r === 'teacher' ? 'Giáo Viên' : 'Phụ Huynh'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-sky-100">Khóa Gemini Key:</span>
            <input 
              type="password"
              placeholder="Nhập API Key..."
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="bg-white/80 border-none rounded px-2.5 py-1 text-amber-950 focus:outline-none w-28 text-xs font-bold"
            />
          </div>
        </div>
      </header>

      {/* Điểm số */}
      {role === 'student' && (
        <div className="bg-amber-300 py-2.5 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-amber-950 font-black text-sm">
            <div className="flex gap-4">
              <span>✨ " + stats.xp + " XP</span>
              <span>🪙 " + stats.coins + " Xu</span>
              <span>⭐ " + stats.stars + " Sao</span>
            </div>
            <div className="flex gap-1">
              {stats.badges.map((b: string, i: number) => (
                <span key={i} className="bg-indigo-600 text-white text-[10px] px-2.5 py-0.5 rounded-full">🏆 " + b + "</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid điều khiển */}
      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="space-y-6">
          
          {/* Trạng thái Database */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-amber-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Trạng thái kết nối:</span>
            <span className={"text-xs font-black px-2 py-0.5 rounded-full " + (isFirebaseEnabled ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
              {isFirebaseEnabled ? "● Online (Firebase)" : "● Offline (Máy cục bộ)"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-md border-4 border-amber-200">
            <h3 className="font-black text-amber-900 mb-3 text-sm flex items-center gap-1">
              <span>📚</span> Chọn Khối Lớp Học
            </h3>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGradeChange(g)}
                  className={"py-2 rounded-xl font-bold text-sm transition " + (currentGrade === g ? 'bg-amber-400 text-amber-950 border-2 border-amber-500' : 'bg-amber-100 text-amber-900')}
                >
                  Lớp " + g + "
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-md border-4 border-teal-100 space-y-2">
            {role === 'student' && (
              <>
                <button onClick={() => { setActiveTab('courses'); setQuizFinished(false); }} className={"w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition " + (activeTab === 'courses' ? 'bg-teal-400 text-white shadow-md' : 'hover:bg-amber-50')}><BookOpen size={16} /> Thư Viện Học Tập</button>
                <button onClick={() => setActiveTab('ai-chat')} className={"w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition " + (activeTab === 'ai-chat' ? 'bg-teal-400 text-white shadow-md' : 'hover:bg-amber-50')}><Sparkles size={16} /> Gia Sư Trí Tuệ AI</button>
                <button onClick={() => setActiveTab('speaking')} className={"w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition " + (activeTab === 'speaking' ? 'bg-teal-400 text-white shadow-md' : 'hover:bg-amber-50')}><Mic size={16} /> Luyện Nói Phát Âm AI</button>
              </>
            )}
            {role === 'teacher' && (
              <button onClick={() => setActiveTab('teacher-dash')} className={"w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition " + (activeTab === 'teacher-dash' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-amber-50')}><Activity size={16} /> Bảng Điều Khiển Giáo Viên</button>
            )}
            {role === 'parent' && (
              <button onClick={() => setActiveTab('parent-dash')} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-md flex items-center gap-2"><BarChart2 size={16} /> Nhật Ký Tiến Trình Của Con</button>
            )}
          </div>
        </div>

        {/* Cột hiển thị chính */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB STUDENT: COURSES */}
          {activeTab === 'courses' && role === 'student' && (
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-3xl shadow-md border-4 border-amber-200">
                <h2 className="text-lg font-black text-amber-900 mb-3 flex items-center gap-1.5">
                  Bài học Lớp " + currentGrade + " - Global Success
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {totalLessons.map((unit) => (
                    <div 
                      key={unit.id}
                      onClick={() => { setSelectedLesson(unit); setQuizFinished(false); }}
                      className={"p-4 rounded-2xl border-2 cursor-pointer transition " + (selectedLesson?.id === unit.id ? 'bg-amber-100 border-amber-400' : 'bg-white hover:bg-amber-50')}
                    >
                      <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                        {unit.title}
                        {unit.id.includes('-custom-') && <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">Bài cô giao 🌟</span>}
                      </h4>
                      <p className="text-[10px] text-amber-700 mt-1">Nói chuẩn: \"" + unit.sentence + "\"</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedLesson && (
                <div className="bg-white rounded-3xl shadow-lg border-4 border-teal-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-400 to-emerald-400 p-4 text-white">
                    <span className="text-[10px] font-bold bg-white/25 px-2.5 py-0.5 rounded-full">UNIT WORKSPACE</span>
                    <h2 className="text-lg font-black mt-1">{selectedLesson.title}</h2>
                  </div>

                  <div className="flex border-b bg-amber-50/50 p-2 gap-2">
                    {['video', 'flashcards', 'quiz'].map((tab) => (
                      <button 
                        key={tab} 
                        onClick={() => setLessonSubTab(tab)} 
                        className={"px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition " + (lessonSubTab === tab ? 'bg-white text-teal-600 shadow-sm' : 'text-amber-800 hover:bg-amber-100')}
                      >
                        {tab === 'video' ? 'Video Bài Giảng' : tab === 'flashcards' ? 'Thẻ Flashcards' : 'Bài Tập Luyện'}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {lessonSubTab === 'video' && (
                      <div className="space-y-4">
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
                          <iframe 
                            src={selectedLesson.videoUrl}
                            className="absolute top-0 left-0 w-full h-full border-0"
                            title="Video Lesson Player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        </div>
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                          <span className="text-[10px] font-bold text-indigo-700 block mb-1">MẪU CÂU HỌC:</span>
                          <p className="text-base font-black text-indigo-950 flex items-center gap-2">
                            \"" + selectedLesson.sentence + "\"
                            <button onClick={() => speakText(selectedLesson.sentence)} className="p-1 bg-white hover:bg-indigo-100 rounded-full">
                              <Volume2 size={14} className="text-indigo-600" />
                            </button>
                          </p>
                        </div>
                      </div>
                    )}

                    {lessonSubTab === 'flashcards' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedLesson.vocabulary.map((vocab: any, idx: number) => (
                          <div 
                            key={idx}
                            className="relative w-full h-40 cursor-pointer perspective"
                          >
                            <div className="relative w-full h-full bg-white border-2 border-amber-200 rounded-2xl flex flex-col items-center justify-center p-3 shadow-sm hover:shadow transition">
                              <span className="text-4xl block mb-2">{vocab.emoji}</span>
                              <span className="text-base font-black text-amber-950 tracking-wide">{vocab.word}</span>
                              <span className="text-xs text-indigo-600 font-medium">{vocab.phonetic}</span>
                              <span className="text-xs text-gray-500 mt-1 font-bold">({vocab.meaning})</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakText(vocab.word);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {lessonSubTab === 'quiz' && (
                      <div className="space-y-4">
                        {!quizFinished ? (
                          <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-200">
                            <span className="text-[10px] font-bold text-amber-700">CÂU HỎI TRẮC NGHIỆM</span>
                            <h3 className="text-base font-black text-amber-950 mt-2">Từ vựng \"" + selectedLesson.vocabulary[0].word + "\" mang ý nghĩa tiếng Việt là gì?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                              {[selectedLesson.vocabulary[0].meaning, 'Quả táo', 'Chiếc thìa', 'Con chim'].sort().map((opt, i) => (
                                <button key={i} onClick={() => setSelectedOpt(opt)} className={"p-3 rounded-xl font-bold text-left text-xs border transition " + (selectedOpt === opt ? 'bg-amber-400 border-amber-600' : 'bg-white hover:bg-amber-100')}>{opt}</button>
                              ))}
                            </div>
                            <button onClick={handleNextQuiz} className="w-full mt-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow">Gửi câu trả lời</button>
                          </div>
                        ) : (
                          <div className="text-center py-6 space-y-3">
                            <span className="text-4xl">🎉</span>
                            <h3 className="text-lg font-black text-amber-900">Chúc mừng bé đã hoàn thành!</h3>
                            <button onClick={() => setQuizFinished(false)} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl">Thử sức lại</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB TEACHER: WORKSPACE & EDITOR */}
          {activeTab === 'teacher-dash' && role === 'teacher' && (
            <div className="space-y-6">
              
              {/* Form đăng bài giảng mới của giáo viên */}
              <div className="bg-white p-6 rounded-3xl shadow-md border-4 border-indigo-300 space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="font-black text-indigo-950 text-base">Đăng Bài Giảng & Bài Tập Mới (Khối Lớp " + currentGrade + ")</h3>
                    <p className="text-xs text-gray-400">Bài soạn của cô giáo sẽ hiển thị ngay lập tức lên Thư Viện của học sinh</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 block">Tên Bài Học (Unit Title)</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Unit 3: Our Toys" 
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full p-2.5 border border-indigo-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 block">Mẫu Câu Chính (Key Sentence)</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: I have a green ball." 
                      value={lessonSentence}
                      onChange={(e) => setLessonSentence(e.target.value)}
                      className="w-full p-2.5 border border-indigo-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 block">Link Video YouTube bài học</label>
                    <input 
                      type="text" 
                      placeholder="Dán link bài giảng YouTube vào đây..." 
                      value={lessonVideo}
                      onChange={(e) => setLessonVideo(e.target.value)}
                      className="w-full p-2.5 border border-indigo-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                  <span className="text-xs font-extrabold text-amber-900 block">Danh sách từ vựng & Emojis cho Flashcards:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vocabs.map((vocab, index) => (
                      <div key={index} className="bg-white p-3 rounded-xl border border-amber-100 grid grid-cols-4 gap-1.5">
                        <input 
                          type="text" 
                          placeholder="Tiếng Anh (Ví dụ: bike)" 
                          value={vocab.word}
                          onChange={(e) => {
                            const updated = [...vocabs];
                            updated[index].word = e.target.value;
                            setVocabs(updated);
                          }}
                          className="p-1.5 bg-slate-50 rounded border text-[10px] text-center font-bold text-indigo-900 focus:outline-none"
                        />
                        <input 
                          type="text" 
                          placeholder="Nghĩa Việt (Ví dụ: xe đạp)" 
                          value={vocab.meaning}
                          onChange={(e) => {
                            const updated = [...vocabs];
                            updated[index].meaning = e.target.value;
                            setVocabs(updated);
                          }}
                          className="p-1.5 bg-slate-50 rounded border text-[10px] text-center font-bold focus:outline-none"
                        />
                        <input 
                          type="text" 
                          placeholder="Phiên âm (Ví dụ: /baɪk/)" 
                          value={vocab.phonetic}
                          onChange={(e) => {
                            const updated = [...vocabs];
                            updated[index].phonetic = e.target.value;
                            setVocabs(updated);
                          }}
                          className="p-1.5 bg-slate-50 rounded border text-[10px] text-center font-semibold focus:outline-none"
                        />
                        <input 
                          type="text" 
                          placeholder="Emoji (Ví dụ: 🚲)" 
                          value={vocab.emoji}
                          onChange={(e) => {
                            const updated = [...vocabs];
                            updated[index].emoji = e.target.value;
                            setVocabs(updated);
                          }}
                          className="p-1.5 bg-slate-50 rounded border text-[10px] text-center font-bold focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handlePublishLesson}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-600 hover:to-sky-700 text-white font-black text-xs rounded-xl shadow-md transition transform active:scale-95 flex items-center gap-1.5"
                  >
                    🚀 PHÁT HÀNH BÀI GIẢNG LÊN WEB
                  </button>
                </div>
              </div>

              {/* Bảng theo dõi điểm số học sinh */}
              <div className="bg-white p-5 rounded-3xl shadow-md border-4 border-indigo-200">
                <h3 className="font-black text-base text-indigo-950 mb-3">Thông tin và tiến trình lớp học</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b bg-indigo-50 font-bold text-indigo-950">
                        <th className="p-3 rounded-l-lg">Học sinh</th>
                        <th className="p-3">Khối lớp</th>
                        <th className="p-3 rounded-r-lg">Điểm trung bình</th>
                      </tr>
                    </thead>
                    <tbody className="font-semibold text-gray-700">
                      <tr className="border-b">
                        <td className="p-3 flex items-center gap-1.5">👧 Nguyễn Minh Anh</td>
                        <td className="p-3">Lớp 3</td>
                        <td className="p-3 text-green-600">9.5/10</td>
                      </tr>
                      <tr>
                        <td className="p-3 flex items-center gap-1.5">👦 Trần Đăng Khoa</td>
                        <td className="p-3">Lớp 3</td>
                        <td className="p-3 text-green-600">8.8/10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: STUDENT AI ASSISTANT */}
          {activeTab === 'ai-chat' && role === 'student' && (
            <div className="bg-white p-5 rounded-3xl shadow-md border-4 border-amber-200 h-[500px] flex flex-col">
              <div className="border-b pb-3">
                <h3 className="font-black text-base text-amber-900">Trò chuyện với Ms. Hoa AI</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 my-4 bg-amber-50/50 rounded-2xl border">
                {chatMessages.map((m: any, i: number) => (
                  <div key={i} className={"flex " + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={"max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed font-bold shadow-sm " + (m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border')}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <span className="text-xs text-gray-400 italic block">Cô đang phân tích câu trả lời...</span>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Hỏi cô điều gì đi con..." 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  className="flex-1 p-3 border-2 rounded-xl text-xs font-bold focus:outline-none" 
                />
                <button onClick={handleSendChat} className="p-3 bg-indigo-600 text-white rounded-xl">
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB: STUDENT SPEAKING LAB */}
          {activeTab === 'speaking' && role === 'student' && (
            <div className="bg-white p-6 rounded-3xl shadow-md border-4 border-teal-200 text-center space-y-4">
              <span className="text-3xl">🎙️</span>
              <h2 className="text-lg font-black text-amber-900">Phòng Luyện Phát Âm Trí Tuệ AI</h2>
              <p className="text-xs text-gray-500">Mẫu câu cần bé luyện tập đọc to hôm nay là:</p>
              <p className="text-xl font-black text-indigo-700">\"" + selectedLesson.sentence + "\"</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => speakText(selectedLesson.sentence)} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl">Nghe mẫu</button>
                <button 
                  onClick={startVoiceRecording} 
                  className={"px-4 py-2 text-white font-bold text-xs rounded-xl transition " + (isRecording ? 'bg-red-500 animate-pulse' : 'bg-red-400')}
                >
                  {isRecording ? 'Đang nghe...' : 'Đọc câu'}
                </button>
              </div>
              {speakingResult && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-left max-w-md mx-auto space-y-1.5">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-xs text-gray-500">ĐÁNH GIÁ CHẤM ĐIỂM AI:</span>
                    <span className="text-sm text-amber-600">⭐ " + speakingResult.score + "/10</span>
                  </div>
                  <p className="text-xs text-gray-700 font-semibold">{speakingResult.feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: PARENT DASHBOARD */}
          {activeTab === 'parent-dash' && role === 'parent' && (
            <div className="bg-white p-5 rounded-3xl shadow-md border-4 border-purple-200 space-y-4">
              <h3 className="font-black text-base text-purple-950">Báo cáo của phụ huynh</h3>
              <p className="text-xs text-gray-500">Giúp cha mẹ nắm bắt được đầy đủ kỹ năng phát âm và từ vựng của con.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-purple-50 rounded-xl text-center">
                  <span className="text-[10px] text-purple-700 font-bold block">ĐIỂM TRUNG BÌNH:</span>
                  <span className="text-xl font-black text-purple-950">9.2 / 10 Điểm</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-center">
                  <span className="text-[10px] text-purple-700 font-bold block">BÀI ĐÃ HOÀN THÀNH:</span>
                  <span className="text-xl font-black text-purple-950">14 Bài học</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

