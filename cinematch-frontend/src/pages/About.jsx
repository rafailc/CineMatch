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
            iconUrl: "/icons/gomu2.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Lefteris L.",
            title: "Full-Stack Developer",
            handle: "ClownaKYS",
            avatarUrl: "/avatars/luffy2.png",
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
            miniAvatarUrl: "/avatars/lol.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Developer 4",
            title: "UI/UX Designer",
            handle: "dev4",
            avatarUrl: "/avatars/dev4.png",
        },
        {
            name: "Developer 5",
            title: "Software Engineer",
            handle: "dev5",
            avatarUrl: "/avatars/dev5.png",
        },
        {
            name: "Developer 6",
            title: "Data Scientist",
            handle: "dev6",
            avatarUrl: "/avatars/dev6.png",
        },
        {
            name: "Developer 7",
            title: "AI Developer",
            handle: "dev7",
            avatarUrl: "/avatars/dev7.png",
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
