import DemoCard from "@/components/UI/Demos/DemoCard";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

const demos = [
  {
    title: "Markdown Editor",
    description: "A real-time markdown editor with live preview",
    icon: <PencilSquareIcon className="h-12 w-12" />,
    link: "/demos/editor",
  },
  // Add more demos here as they are created
];

export default function DemosPage() {
  return (
    <div className="container h-[85vh] mx-auto max-w-5xl px-2 py-8">
      <h1 className="mb-8 text-4xl font-bold">Demos</h1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo, index) => (
          <DemoCard
            key={index}
            title={demo.title}
            description={demo.description}
            icon={demo.icon}
            link={demo.link}
          />
        ))}
      </div>
    </div>
  );
}
