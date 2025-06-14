import Link from "next/link";
import Depth3D from "@/components/UI/Animation/Depth3D";

type DemoCardProps = {
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
}

export default function DemoCard({ title, description, icon, link }: DemoCardProps) {
    return (
        <Link href={link} className="block">
            <Depth3D hardness={30}>
                <div className="group flex h-full flex-col items-center justify-center rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="rounded-full bg-neutral-50 p-4 text-neutral-600 transition-colors group-hover:bg-neutral-100 group-hover:text-neutral-900">
                            {icon}
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900">
                            {title}
                        </h2>
                        <p className="text-center text-sm text-neutral-500">
                            {description}
                        </p>
                    </div>
                </div>
            </Depth3D>
        </Link>
    )
}