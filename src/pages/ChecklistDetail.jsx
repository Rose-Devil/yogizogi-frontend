import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ArrowLeft, Share2, Trash2, Check } from "lucide-react";
import { useState } from "react";

const notoSansKR = "Noto Sans KR";

export default function ChecklistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // 백엔드 필드(체크리스트 상세):
  // - checklist: id, title, description
  // - items: id, name, assignedTo, quantity, isCompleted
  // - members: id, name, role
  const [items, setItems] = useState([
    {
      id: "1",
      name: "여권",
      assignedTo: "김철수",
      quantity: 1,
      isCompleted: true,
    },
    {
      id: "2",
      name: "신용카드",
      assignedTo: "박영희",
      quantity: 2,
      isCompleted: false,
    },
    {
      id: "3",
      name: "선글라스",
      assignedTo: "김철수",
      quantity: 3,
      isCompleted: false,
    },
  ]);

  const [members, setMembers] = useState([
    { id: "1", name: "김철수", role: "생성자" },
    { id: "2", name: "박영희", role: "멤버" },
    { id: "3", name: "이순신", role: "멤버" },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemAssignee, setNewItemAssignee] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");

  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem = {
        id: Date.now().toString(),
        name: newItemName,
        assignedTo: newItemAssignee || "미정",
        quantity: Number.parseInt(newItemQuantity) || 1,
        isCompleted: false,
      };
      setItems([...items, newItem]);
      setNewItemName("");
      setNewItemAssignee("");
      setNewItemQuantity("1");
    }
  };

  const handleToggleItem = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleLeaveChecklist = () => {
    if (confirm("이 체크리스트에서 나가시겠습니까?")) {
      navigate("/checklist");
    }
  };

  const completedCount = items.filter((item) => item.isCompleted).length;

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/checklist"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.png"
                alt="여기저기"
                className="w-10 h-10 rounded-lg flex-shrink-0"
              />
              <span
                className="text-xl text-foreground hidden sm:inline"
                style={{
                  fontFamily: notoSansKR,
                  fontWeight: 900,
                  transform: "translate(-7px, 1.5px)",
                }}
              >
                여기저기
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                className="border-border hover:bg-secondary bg-transparent gap-2"
              >
                <Share2 className="w-4 h-4" />
                공유
              </Button>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 페이지 제목 및 진행률 */}
        <div className="mb-8">
          <Link
            to="/checklist"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Link>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1
                className="text-3xl font-black text-foreground mb-2"
                style={{ fontFamily: notoSansKR }}
              >
                제주도 여행 준비
              </h1>
              <p className="text-muted-foreground">2월 제주도 가족여행</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-1">
                {completedCount}/{items.length}
              </div>
              <p className="text-sm text-muted-foreground">완료</p>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="w-full bg-secondary rounded-full h-2 mb-8">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / items.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* 체크리스트 항목 */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 p-6 mb-6">
              <h2
                className="text-lg font-black text-foreground mb-4"
                style={{ fontFamily: notoSansKR }}
              >
                준비물 추가
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="준비할 물품"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newItemAssignee}
                    onChange={(e) => setNewItemAssignee(e.target.value)}
                    placeholder="담당자 (선택)"
                    className="px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="수량"
                    min="1"
                    className="px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <Button
                  onClick={handleAddItem}
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  추가
                </Button>
              </div>
            </Card>

            {/* 체크리스트 항목 목록 */}
            <Card className="border-border/50 p-6">
              <h2
                className="text-lg font-black text-foreground mb-4"
                style={{ fontFamily: notoSansKR }}
              >
                준비물 목록
              </h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors group"
                  >
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        item.isCompleted
                          ? "bg-primary border-primary"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {item.isCompleted && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium ${
                          item.isCompleted
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.name}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>담당: {item.assignedTo}</span>
                        <span>수량: {item.quantity}개</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex-shrink-0 p-2 rounded hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 사이드바 - 팀 멤버 */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 p-6 sticky top-24">
              <h3
                className="text-lg font-black text-foreground mb-4"
                style={{ fontFamily: notoSansKR }}
              >
                팀 멤버 ({members.length})
              </h3>

              <div className="space-y-3 mb-6">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-4">
                <Button
                  onClick={handleLeaveChecklist}
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  체크리스트 나가기
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
