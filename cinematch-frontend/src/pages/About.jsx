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
            iconUrl: "/icons/watar.png",
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
            miniAvatarUrl: "/avatars/g.png",
            iconUrl: "/icons/bomb.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Angelos K.",
            title: "Developer",
            handle: "3genis",
            avatarUrl: "/avatars/10.png",
            miniAvatarUrl: "/avatars/9.png",
            iconUrl: "/icons/fotia.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Georgios L.",
            title: "Developer",
            handle: "9iconic6",
            avatarUrl: "/avatars/a.png",
            miniAvatarUrl: "/avatars/b.png",
            iconUrl: "/icons/death.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Vasilis K.",
            title: "Developer",
            handle: "billys",
            avatarUrl: "/avatars/c.png",
            miniAvatarUrl: "/avatars/f.png",
            iconUrl: "/icons/snow.png",
            enableTilt:    true,
            behindGlowEnable: false,
        },
        {
            name: "Athanasios F.",
            title: "Developer",
            handle: "fitsios_th",
            avatarUrl: "/avatars/d.png",
            miniAvatarUrl: "/avatars/e.png",
            iconUrl: "/icons/spear.png",
            enableTilt:    true,
            behindGlowEnable: false,
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
                            className={dev.handle === "ClownaKYS" || dev.handle === "fitsios_th" ? "lift-avatar" : ""}

                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
