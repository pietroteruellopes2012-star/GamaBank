import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins } from "@phosphor-icons/react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await axios.get(`${API}/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>
            <span className="text-[#6BB4E8]">Como Ganhar</span> <span className="text-[#6BB4E8]">GAMAS</span>
          </h1>
          <p className="text-lg md:text-lg sm:text-xl text-[#4B5563] max-w-2xl mx-auto">
            Realize essas atividades e acumule gamas!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="neo-card overflow-hidden"
              data-testid={`activity-card-${index}`}
            >
              <div className="aspect-video overflow-hidden border-b-2 border-[#6BB4E8]">
                <img
                  src={activity.image_url}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg sm:text-xl font-black tracking-tighter mb-2" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                  {activity.name}
                </h3>
                <p className="text-[#4B5563] mb-4 text-sm leading-relaxed">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t-2 border-[#D8EAF5]">
                  <div className="flex items-center gap-2">
                    <Coins size={24} weight="bold" className="text-[#6BB4E8]" />
                    <span className="text-3xl font-black gama-number" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                      +{activity.reward}
                    </span>
                  </div>
                  <span className="text-xs font-semibold bg-[#D8EAF5] px-3 py-1 rounded-full border-2 border-[#6BB4E8]">
                    Ganhe
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-[#4B5563]">Carregando atividades...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}