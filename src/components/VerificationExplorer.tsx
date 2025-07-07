import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const mockProjects = [
  {
    id: 1,
    name: "Solar Reforestation",
    type: "Solar",
    status: "Verified",
    details:
      "ISO 14000 certified, covering 1,000 acres of reforested land with solar canopy overlays.",
    image: "https://images.unsplash.com/photo-1581090700227-1e8e8ab3c24e?auto=format&fit=crop&w=600&h=400&q=80",
  },
  {
    id: 2,
    name: "Mangrove Restoration",
    type: "Forest",
    status: "Pending",
    details:
      "Submitted to Verra. Verification under review for 12,000 hectares of coastal mangroves.",
    image: "https://images.unsplash.com/photo-1604051778815-b2782b221f4c?auto=format&fit=crop&w=600&h=400&q=80",
  },
  {
    id: 3,
    name: "Wind Power Offsets",
    type: "Solar",
    status: "Rejected",
    details:
      "Rejected due to inaccurate emissions baseline measurements from external consultant.",
    image: "https://images.unsplash.com/photo-1584270354949-1b5d44e5f29f?auto=format&fit=crop&w=600&h=400&q=80",
  },
  {
    id: 4,
    name: "Biochar Soil Enhancement",
    type: "Forest",
    status: "Verified",
    details:
      "Enhancing soil with carbon-retaining biochar in deforested areas.",
    image: "https://images.unsplash.com/photo-1605276374112-849c8f0ee1bd?auto=format&fit=crop&w=600&h=400&q=80",
  },
  {
    id: 5,
    name: "Urban Rooftop Solar Grid",
    type: "Solar",
    status: "Pending",
    details:
      "Small-scale urban rooftop installations undergoing verification.",
    image: "https://images.unsplash.com/photo-1622658099442-70f87711d6cd?auto=format&fit=crop&w=600&h=400&q=80",
  },
];

export default function VerificationExplorer() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(2);

  const filtered = mockProjects.filter(
    (p) =>
      (typeFilter === "All" || p.type === typeFilter) &&
      (statusFilter === "All" || p.status === statusFilter) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const visibleProjects = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {["All", "Solar", "Forest"].map((type) => (
            <Button
              key={type}
              onClick={() => setTypeFilter(type)}
              variant={typeFilter === type ? "default" : "ghost"}
            >
              {type}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {["All", "Verified", "Pending", "Rejected"].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant={statusFilter === status ? "default" : "ghost"}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Project Cards */}
      {visibleProjects.map((project) => (
        <div key={project.id} className="cursor-default">
          <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <img
                src={project.image}
                alt={project.name}
                onError={(e) =>
                  (e.currentTarget.src = "https://placehold.co/400x300?text=Unavailable")
                }
                className="w-full md:w-48 h-32 object-cover rounded-l-md bg-gray-200"
              />
              <CardContent className="p-4 w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {project.type === "Solar" ? "☀️" : "🌲"} {project.name}
                    </h3>
                    <p className="text-sm text-gray-500">{project.type}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      project.status === "Verified"
                        ? "bg-green-100 text-green-700"
                        : project.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {project.status === "Verified"
                      ? "✅"
                      : project.status === "Pending"
                      ? "⏳"
                      : "❌"}{" "}
                    {project.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-700">{project.details}</p>
              </CardContent>
            </div>
          </Card>
        </div>
      ))}

      {/* Load More */}
      {visibleCount < filtered.length && (
        <div className="text-center mt-4">
          <Button onClick={() => setVisibleCount((prev) => prev + 2)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}