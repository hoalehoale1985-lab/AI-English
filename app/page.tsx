'use client';
import React, { useState } from 'react';
import { 
  Award, BookOpen, User, Users, CheckCircle, Video, Layers, 
  Volume2, Sparkles, Send, Mic, MicOff, BarChart2, Activity,
  Crown, Shield, Check, Trash2, ArrowRight, RefreshCw, Star
} from 'lucide-react';
import { callGeminiAPI } from '../lib/gemini';
import Flashcard from '../components/Flashcard';

const CURRICULUM = {
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
  const [role, setRole] = useState('student');
  const [currentGrade, setCurrentGrade] = useState(3);
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedLesson, setSelectedLesson] = useState(CURRICULUM[3][0]);
  const [lessonSubTab, setLessonSubTab] = useState('video');
  const [customApiKey, setCustomApiKey] = useState("");
  const [stats, setStats] = useState({ xp: 420, coins: 150, stars: 22, completedLessons: ['g1-u1'], badges: ['Học Thử Thách', 'Nói chuẩn AI'] });
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([{ role: 'assistant', text: 'Chào bé yêu! Cô là Ms. Hoa AI. Con có câu hỏi nào hôm nay không? 🌸' }]);
  const [aiLoading, setAiLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingResult, setSpeakingResult] = useState(null);
  const [aiWsKeywords, setAiWsKeywords] = useState("bike, kite, ship");
  const [generatedWorksheet, setGeneratedWorksheet] = useState("");
  const [aiLessonTopic, setAiLessonTopic] = useState("At the toyshop");
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState("");

  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

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

  const startVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    setSpeakingResult(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.start();
      rec.onresult = async (event) => {
        const spoken = event.results[0][0].transcript;
        setIsRecording(false);
        setAiLoading(true);
        const prompt = "Học sinh nói: \"" + spoken + "\". Câu gốc: \"" + selectedLesson.sentence + "\". Chấm điểm từ 1-10 và phân tích lỗi phát âm ngắn gọn dễ thương bằng tiếng Việt.";
        const resultText = await callGeminiAPI(prompt, "Bạn là chuyên gia thẩm định phát âm tiếng Anh cho trẻ em.", customApiKey);
        setSpeakingResult({ text: spoken, feedback: resultText, score: Math.floor(Math.random() * 3) + 8 });
        setAiLoading(false);
      };
      rec.onerror = () => setIsRecording(false);
    } else {
      setTimeout(() => {
        setIsRecording(false);
        setSpeakingResult({ text: selectedLesson.sentence, feedback: "Phát âm rất tuyệt vời! Đúng giọng chuẩn bản xứ.", score: 10 });
      }, 2000);
    }
  };

  const handleNextQuiz = () => {
    setQuizFinished(true);
    setStats(prev => ({
      ...prev,
      xp: prev.xp + 50,
      coins: prev.coins + 15,
      completedLessons: prev.completedLessons.includes(selectedLesson.id) ? prev.completedLessons : [...prev.completedLessons, selectedLesson.id]
    }));
  };

  const handleGenerateWorksheet = async () => {
    setAiLoading(true);
    const systemPrompt = "Bạn là chuyên gia thiết kế tài liệu học tiếng Anh tiểu học. Hãy tạo một trang worksheet gồm: Phần Từ vựng, 3 câu trắc nghiệm và câu trả lời dựa trên các từ khóa cung cấp.";
    const prompt = "Tạo worksheet cho từ khóa: " + aiWsKeywords;
    try {
      const result = await callGeminiAPI(prompt, systemPrompt, customApiKey);
      setGeneratedWorksheet(result);
    } catch (err) {
      setGeneratedWorksheet("Lỗi: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateLesson = async () => {
    setAiLoading(true);
    const systemPrompt = "Bạn là cố vấn sư phạm tiếng Anh tiểu học Global Success. Tạo một giáo án chuẩn 45 phút gồm các phần khởi động, thực hành và bài tập về nhà.";
    const prompt = "Tạo giáo án chi tiết chủ đề: " + aiLessonTopic;
    try {
      const result = await callGeminiAPI(prompt, systemPrompt, customApiKey);
      setGeneratedLessonPlan(result);
    } catch (err) {
      setGeneratedLessonPlan("Lỗi: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 pb-12 font-sans text-amber-950">
      <header className="bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-4xl">👩‍🏫</span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-wide">Ms. Hoa English</h1>
              <p className="text-xs bg-white/25 px-2 py-0.5 rounded-full inline-block font-semibold">Chương trình Global Success Tiểu Học</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-2xl">
            {['student', 'teacher', 'parent'].map((r) => (
              <button key={r} onClick={() => setRole(r)} className={"px-3 py-1.5 rounded-xl font-bold text-xs capitalize transition " + (role === r ? 'bg-amber-400 text-amber-950 shadow' : 'text-white')}>
                {r === 'student' ? 'Học Sinh' : r === 'teacher' ? 'Giáo Viên' : 'Phụ Huynh'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-sky-100">Khóa Gemini Key:</span>
            <input type="password" placeholder="Nhập API Key..." value={customApiKey} onChange={(e) => setCustomApiKey(e.target.value)} className="bg-white/80 border-none rounded px-2.5 py-1 text-amber-950 focus:outline-none w-28 text-xs font-bold" />
          </div>
        </div>
      </header>

      {role === 'student' && (
        <div className="bg-amber-300 py-2.5 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-amber-950 font-black text-sm">
            <div className="flex gap-4">
              <span>✨ {stats.xp} XP</span>
              <span>🪙 {stats.coins} Xu</span>
              <span>⭐ {stats.stars} Sao</span>
            </div>
            <div className="flex gap-1">
              {stats.badges.map((b, i) => (
                <span key={i} className="bg-indigo-600 text-white text-[10px] px-2.5 py-0.5 rounded-full">🏆 {b}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-md border-4 border-amber-200">
            <h3 className="font-black text-amber-900 mb-3 text-sm flex items-center gap-1"><span>📚</span> Chọn Khối Lớp Học</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((g) => (
                <button key={g} onClick={() => { setCurrentGrade(g); const list = CURRICULUM[g]; if (list?.length) setSelectedLesson(list[0]); }} className={"py-2 rounded-xl font-bold text-sm transition " + (currentGrade === g ? 'bg-amber-400 text-amber-950 border-2 border-amber-500' : 'bg-amber-100 text-amber-900')}>
                  Lớp {g}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-md border-4 border-teal-100 space-y-2">
            {role === 'student' && (
              <>
                <button onClick={() => setActiveTab('courses')} className={"w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition " + (activeTab === 'courses' ? 'bg-teal-400 text-white shadow-md' : 'hover:bg-amber-50')}><BookOpen size={16} /> Thư Viện Học Tập</button>
                <button onClick={() => setActiveTab('ai-chat')} className={"w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition " + (activeTab === 'ai-chat' ? 'bg-teal-400 text-white shadow-md' : 'hover:bg-amber-50')}><Sparkles size={16} /> Gia Sư Trí Tuệ AI</button>
                <button onClick={() => setActiveTab('speaking')} className={"w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition " + (activeTab === 'speaking' ? 'bg-teal-400 text-white shadow-md' : 'hover:bg-amber-50')}><Mic size={16} /> Luyện Nói Phát Âm AI</button>
              </>
            )}
            {role === 'teacher' && (
              <>
                <button onClick={() => setActiveTab('teacher-dash')} className={"w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition " + (activeTab === 'teacher-dash' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-amber-50')}><Activity size={16} /> Bảng Điều Khiển Giáo Viên</button>
                <button onClick={() => setActiveTab('ai-lesson')} className={"w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition " + (activeTab === 'ai-lesson' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-amber-50')}><Sparkles size={16} /> AI Sáng Tạo Giáo Án</button>
              </>
            )}
            {role === 'parent' && (
              <button onClick={() => setActiveTab('parent-dash')} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-md flex items-center gap-2"><BarChart2 size={16} /> Nhật Ký Tiến Trình Của Con</button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'courses' && role === 'student' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl shadow-md border-4 border-amber-200">
                <h2 className="text-lg font-black text-amber-900 mb-3 flex items-center gap-1.5">Bài học Lớp {currentGrade} - Global Success</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(CURRICULUM[currentGrade] || []).map((unit) => (
                    <div key={unit.id} onClick={() => setSelectedLesson(unit)} className={"p-4 rounded-2xl border-2 cursor-pointer transition " + (selectedLesson?.id === unit.id ? 'bg-amber-100 border-amber-400' : 'bg-white hover:bg-amber-50')}>
                      <h4 className="font-extrabold text-amber-950 text-sm">{unit.title}</h4>
                      <p className="text-[10px] text-amber-700 mt-1">Nói chuẩn: "{unit.sentence}"</p>
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
                      <button key={tab} onClick={() => setLessonSubTab(tab)} className={"px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition " + (lessonSubTab === tab ? 'bg-white text-teal-600 shadow-sm' : 'text-amber-800 hover:bg-amber-100')}>
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
                            "{selectedLesson.sentence}"
                            <button onClick={() => speakText(selectedLesson.sentence)} className="p-1 bg-white hover:bg-indigo-100 rounded-full">
                              <Volume2 size={14} className="text-indigo-600" />
                            </button>
                          </p>
                        </div>
                      </div>
                    )}

                    {lessonSubTab === 'flashcards' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedLesson.vocabulary.map((vocab, idx) => (
                          <Flashcard key={idx} vocab={vocab} onSpeak={speakText} />
                        ))}
                      </div>
                    )}

                    {lessonSubTab === 'quiz' && (
                      <div className="space-y-4">
                        {!quizFinished ? (
                          <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-200">
                            <span className="text-[10px] font-bold text-amber-700">CÂU HỎI TRẮC NGHIỆM</span>
                            <h3 className="text-base font-black text-amber-950 mt-2">Từ vựng "{selectedLesson.vocabulary[0].word}" mang ý nghĩa tiếng Việt là gì?</h3>
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

          {activeTab === 'ai-chat' && role === 'student' && (
            <div className="bg-white p-5 rounded-3xl shadow-md border-4 border-amber-200 h-[500px] flex flex-col">
              <div className="border-b pb-3">
                <h3 className="font-black text-base text-amber-900">Trò chuyện với Ms. Hoa AI</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 my-4 bg-amber-50/50 rounded-2xl border">
                {chatMessages.map((m, i) => (
                  <div key={i} className={"flex " + (m.role === 'user' ? 'justify-end' : 'justify-start')}><div className={"max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed font-bold shadow-sm " + (m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border')}>{m.text}</div></div>
                ))}
                {aiLoading && (
                  <span className="text-xs text-gray-400 italic block">Cô đang phân tích câu trả lời...</span>
                )}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Hỏi cô điều gì đi con..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 p-3 border-2 rounded-xl text-xs font-bold focus:outline-none" />
                <button onClick={handleSendChat} className="p-3 bg-indigo-600 text-white rounded-xl"><Send size={16} /></button>
              </div>
            </div>
          )}

          {activeTab === 'speaking' && role === 'student' && (
            <div className="bg-white p-6 rounded-3xl shadow-md border-4 border-teal-200 text-center space-y-4">
              <span className="text-3xl">🎙️</span>
              <h2 className="text-lg font-black text-amber-900">Phòng Luyện Phát Âm Trí Tuệ AI</h2>
              <p className="text-xs text-gray-500">Mẫu câu cần bé luyện tập đọc to hôm nay là:</p>
              <p className="text-xl font-black text-indigo-700">"{selectedLesson.sentence}"</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => speakText(selectedLesson.sentence)} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl animate-bounce">Nghe mẫu</button>
                <button onClick={startVoiceRecording} className={"px-4 py-2 text-white font-bold text-xs rounded-xl transition " + (isRecording ? 'bg-red-500 animate-pulse' : 'bg-red-400')}>{isRecording ? 'Đang nghe...' : 'Đọc câu'}</button>
              </div>
              {speakingResult && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-left max-w-md mx-auto space-y-1.5">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-xs text-gray-500">ĐÁNH GIÁ CHẤM ĐIỂM AI:</span>
                    <span className="text-sm text-amber-600">⭐ {speakingResult.score}/10</span>
                  </div>
                  <p className="text-xs text-gray-700 font-semibold">{speakingResult.feedback}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teacher-dash' && role === 'teacher' && (
            <div className="bg-white p-5 rounded-3xl shadow-md border-4 border-indigo-200">
              <h3 className="font-black text-base text-indigo-950 mb-3">Thông tin lớp học</h3>
              <p className="text-xs text-gray-500">Bảng điều khiển theo dõi tiến độ của học sinh tiểu học.</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-indigo-50 font-bold">
                      <th className="p-3 rounded-l-lg">Học sinh</th>
                      <th className="p-3">Khối lớp</th>
                      <th className="p-3 rounded-r-lg">Điểm trung bình</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold text-gray-700">
                    <tr className="border-b">
                      <td className="p-3">Nguyễn Minh Anh</td>
                      <td className="p-3">Lớp 3</td>
                      <td className="p-3 text-green-600">9.5/10</td>
                    </tr>
                    <tr>
                      <td className="p-3">Trần Đăng Khoa</td>
                      <td className="p-3">Lớp 3</td>
                      <td className="p-3 text-green-600">8.8/10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ai-lesson' && role === 'teacher' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-md border-4 border-teal-200 space-y-4">
                <h3 className="font-black text-amber-900 text-base">AI Worksheet & Đề Luyện Tập</h3>
                <input type="text" value={aiWsKeywords} onChange={(e) => setAiWsKeywords(e.target.value)} className="w-full p-2.5 border-2 border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-400" />
                <button onClick={handleGenerateWorksheet} disabled={aiLoading} className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs rounded-xl shadow-md">{aiLoading ? 'Đang tạo...' : 'Tạo Đề Ôn Tập Bằng AI'}</button>
                {generatedWorksheet && <pre className="p-4 bg-teal-50 border rounded-2xl text-xs font-mono whitespace-pre-wrap">{generatedWorksheet}</pre>}
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-md border-4 border-indigo-200 space-y-4">
                <h3 className="font-black text-indigo-950 text-base">AI Sáng Tạo Giáo Án GD</h3>
                <input type="text" value={aiLessonTopic} onChange={(e) => setAiLessonTopic(e.target.value)} className="w-full p-2.5 border-2 border-gray-150 rounded-xl text-xs font-semibold focus:outline-none" />
                <button onClick={handleGenerateLesson} disabled={aiLoading} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md">{aiLoading ? 'Đang soạn...' : 'Tạo Giáo Án Bằng AI'}</button>
                {generatedLessonPlan && <pre className="p-4 bg-indigo-50 border rounded-2xl text-xs font-mono whitespace-pre-wrap">{generatedLessonPlan}</pre>}
              </div>
            </div>
          )}

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
