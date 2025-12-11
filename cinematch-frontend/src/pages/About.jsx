import React from "react";
import ProfileCard from "../components/ProfileCard";
import "../styles/about.css";

export default function AboutUsPage() {


    const developers = [

        {
            name: "Rafail C.",
            title: "Developer/Project Manager",
            handle: "BigPOLY",
            avatarUrl: "/avatars/1.png",
            miniAvatarUrl: "/avatars/6.png",
            iconUrl: "/icons/train.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Lefteris L.",
            title: "Full-Stack Developer",
            handle: "ClownaKYS",
            avatarUrl: "/avatars/8.png",
            miniAvatarUrl: "/avatars/luffy.png",
            iconUrl: "/icons/gomu2.png",
            enableTilt:    true,
            behindGlowEnable: false,

        },
        {
            name: "Panagiotis K.",
            title: "Developer",
            handle: "Pakotinis",
            avatarUrl: "/avatars/lol.png",
            miniAvatarUrl: "/avatars/3.jpg",
            iconUrl: "/icons/fotia.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Stathis P.",
            title: "Developer",
            handle: "Salamandra",
            avatarUrl: "/avatars/5.png",
            miniAvatarUrl: "/avatars/4.png",
            iconUrl: "/icons/kratos.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Panagiwtis M.",
            title: "Developer",
            handle: "PMLater",
            avatarUrl: "/avatars/7.png",
            miniAvatarUrl: "/avatars/7.png",
            iconUrl: "/icons/katana.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },

        {
            name: "Maria L.",
            title: "Developer",
            handle: "mar",
            avatarUrl: "/avatars/2.png",
            miniAvatarUrl: "/avatars/2.png",
            iconUrl: "/icons/fire.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Angelos K.",
            title: "Developer",
            handle: "3genis",
            avatarUrl: "/avatars/10.png",
            miniAvatarUrl: "/avatars/9.png",
            iconUrl: "/icons/fire.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Developer 8",
            title: "Mobile Engineer",
            handle: "dev8",
            avatarUrl: "/avatars/dev8.png",
        },
        {
            name: "Developer 9",
            title: "Cloud Architect",
            handle: "dev9",
            avatarUrl: "/avatars/dev9.png",
        },
        {
            name: "Developer 10",
            title: "Game Developer",
            handle: "dev10",
            avatarUrl: "/avatars/dev10.png",
        },
    ];

    return (
        <div className="min-h-screen bg-background pt-24 pb-20">
            <div className="w-full px-10">
                <h1 className="text-5xl font-bold text-center mb-12 text-white">
                    Meet the Team
                </h1>

                {/* GRID ME 2 ROWS × 5 CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-10 justify-items-center">
                    {developers.map((dev, idx) => (
                        <ProfileCard
                            key={idx}
                            name={dev.name}
                            title={dev.title}
                            handle={dev.handle}
                            avatarUrl={dev.avatarUrl}
                            miniAvatarUrl={dev.miniAvatarUrl}
                            iconUrl={dev.iconUrl}
                            grainUrl={dev.grainUrl}
                            behindGlowEnabled={true}
                            className={dev.handle === "ClownaKYS" ? "lift-avatar" : ""}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
