import { useState, useEffect } from "react";
import { Wine, Trash2, Plus, X } from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";

export function ChoppRatingApp() {
  const [chopps, setChopps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bar: "",
    choppType: "",
    rating: 5,
    notes: "",
    evaluator: "Lara",
  });

  useEffect(() => {
    loadChopps();
  }, []);

  const loadChopps = async () => {
    setLoading(true);
    try {
      const choppsRef = collection(db, "chopps");
      const q = query(choppsRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const loaded = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChopps(loaded);
    } catch (error) {
      console.error("Erro ao carregar chopps:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveChopp = async () => {
    if (!formData.bar || !formData.choppType) {
      alert("Preencha o bar e o tipo de chopp!");
      return;
    }

    const newChopp = {
      ...formData,
      date: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, "chopps"), newChopp);
      setChopps([{ id: docRef.id, ...newChopp }, ...chopps]);
      setFormData({
        bar: "",
        choppType: "",
        rating: 5,
        notes: "",
        evaluator: "Lara",
      });
      setShowForm(false);
    } catch (error) {
      alert("Erro ao salvar. Tente novamente!");
    }
  };

  const deleteChopp = async (id) => {
    if (!confirm("Deletar essa avaliação?")) return;
    try {
      await deleteDoc(doc(db, "chopps", id));
      setChopps(chopps.filter((c) => c.id !== id));
    } catch (error) {
      alert("Erro ao deletar.");
    }
  };

  const getAverageRating = () => {
    if (chopps.length === 0) return 0;
    return (
      chopps.reduce((sum, c) => sum + c.rating, 0) / chopps.length
    ).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-gray-700 text-lg font-light">carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-pink-200 sticky top-0 z-10">
        
        <div className="px-6 py-8">
           <div className="flex mb-4">
            <img
              src="/girls.png"
              alt="girls"
              className="w-24 h-24 rounded-2xl object-cover"
            />
          </div>
          <h1
            className="text-4xl font-light text-gray-800 mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            lara & rafa
          </h1>
          <h2
            className="text-2xl font-light text-pink-600 mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            diário de chopps pelo centro leste 💅
          </h2>

          <div className="flex gap-4 text-sm font-light text-gray-600">
            <div>
              <span className="font-normal text-gray-800">{chopps.length}</span>{" "}
              chopps provados
            </div>
            <div>
              média:{" "}
              <span className="font-normal text-gray-800">
                {getAverageRating()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      {!showForm && (
        <div className="px-6 mt-8">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-pink-400 hover:bg-pink-500 text-white font-light py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-lg"
          >
            <Plus size={20} />
            adicionar novo chopp
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="px-6 mt-8">
          <div className="bg-white border-2 border-pink-200 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3
                className="text-xl font-light text-gray-800"
                style={{ fontFamily: "Georgia, serif" }}
              >
                nova avaliação
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">
                  nome do bar
                </label>
                <input
                  type="text"
                  value={formData.bar}
                  onChange={(e) =>
                    setFormData({ ...formData, bar: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-400 focus:outline-none font-light"
                  placeholder="onde vocês foram?"
                />
              </div>

              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">
                  tipo de chopp
                </label>
                <input
                  type="text"
                  value={formData.choppType}
                  onChange={(e) =>
                    setFormData({ ...formData, choppType: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-400 focus:outline-none font-light"
                  placeholder="pilsen, ipa, weiss..."
                />
              </div>

              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">
                  quem provou?
                </label>
                <div className="flex gap-2">
                  {["Lara", "Rafa", "Ambos"].map((person) => (
                    <button
                      key={person}
                      onClick={() =>
                        setFormData({ ...formData, evaluator: person })
                      }
                      className={`flex-1 py-2 rounded-xl font-light transition-colors ${
                        formData.evaluator === person
                          ? "bg-pink-400 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {person.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-gray-600 mb-3">
                  nota: {formData.rating}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f472b6 0%, #f472b6 ${
                      formData.rating * 10
                    }%, #e5e7eb ${formData.rating * 10}%, #e5e7eb 100%)`,
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-light text-gray-600 mb-2">
                  observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-400 focus:outline-none font-light"
                  placeholder="o que acharam?"
                  rows="3"
                />
              </div>

              <button
                onClick={saveChopp}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white font-light py-3 rounded-xl transition-colors"
              >
                salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-6 mt-8 space-y-4 pb-8">
        {chopps.length === 0 ? (
          <div className="text-center py-16">
            <Wine size={48} className="mx-auto mb-4 text-pink-300" />
            <p className="text-gray-600 font-light text-lg">
              nenhum chopp AINDA
            </p>
            <p className="text-gray-400 font-light text-sm mt-1">
              bora beber, diva!
            </p>
          </div>
        ) : (
          chopps.map((chopp) => (
            <div
              key={chopp.id}
              className="bg-white border border-pink-100 rounded-2xl p-5 hover:border-pink-200 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3
                    className="text-xl font-light text-gray-800"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {chopp.bar}
                  </h3>
                  <p className="text-gray-500 font-light text-sm mt-1">
                    {chopp.choppType}
                  </p>
                </div>
                <button
                  onClick={() => deleteChopp(chopp.id)}
                  className="text-gray-300 hover:text-pink-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-1 rounded ${
                      i < chopp.rating ? "bg-pink-400" : "bg-gray-200"
                    }`}
                  />
                ))}
                <span className="ml-2 font-light text-gray-600 text-sm">
                  {chopp.rating}/10
                </span>
              </div>

              {chopp.notes && (
                <p className="text-gray-600 font-light text-sm mb-3 leading-relaxed">
                  {chopp.notes}
                </p>
              )}

              <div className="flex justify-between items-center text-xs font-light text-gray-400 pt-3 border-t border-pink-50">
                <span>{chopp.evaluator.toLowerCase()}</span>
                <span>
                  {new Date(chopp.date).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
