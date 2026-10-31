import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Instagram, ExternalLink, Verified, BadgeCheck } from 'lucide-react';

export function InstagramFeed() {
  const posts = [
    {
      url: "https://www.instagram.com/p/DMenU3jJaQq/",
    image: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1769665573/522677331_18057454616372951_6374246959180024144_n_qzfgia.webp",
      caption: "🌍 ✈️ Not all who wander are lost... some just booked with Paradise Yatra.",
    },
    {
      url: "https://www.instagram.com/p/DQthyqWDLFg/",
    image: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1769665573/578248826_1255859793232106_2918973461870021639_n_svpoxq.jpg",
      caption: "✨ Feeling stuck in the same daily routine? It's time to hit pause and explore something new! 🌴 ✈️",
    },
    {
      url: "https://www.instagram.com/p/DNhyJY7JJx-/",
    image: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1769665573/534637262_18059989928372951_5387980187081451818_n_ftudfk.webp",
      caption: "✨ Embark on a divine journey through Uttarakhand's most sacred temples! 🕉️",
    },
    {
      url: "https://www.instagram.com/p/DMR_QfQpARi/",
    image: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1769665572/521108789_18056976647372951_1580724475895110177_n_djzpfi.webp",
      caption: "🌅 Explore the Soul of Sikkim — Where Every Stop Tells a Story 🏔️ ✨",
    }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute rounded-full"></div>
              <div className="relative">
                <Instagram className="w-10 h-10 text-pink-600" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl !font-black !leading-[1.05] tracking-tight text-slate-900">
              Live from Instagram
            </h2>
          </div>
          <p className="!text-slate-600 text-base md:text-lg leading-relaxed flex items-center gap-2">
            Follow
            <a
              href="https://www.instagram.com/paradiseyatra"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:underline inline-flex items-center gap-1"
            >
              @ParadiseYatra
            </a>
          </p>
        </div>

        <a
          href="https://www.instagram.com/paradiseyatra"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg"
        >
          <Instagram className="w-5 h-5" />
          Follow on Instagram
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {posts.map((post, idx) => (
          <a
            key={idx}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            {/* Post Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1.5px]">
                  <div className="bg-white rounded-full p-[1px] h-full w-full">
                    <div className="bg-slate-100 h-full w-full rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src="https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767618411/DP_y3bf1a.png"
                        alt="profile"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                  </div>
                </div>
                <span className="font-bold text-xs text-slate-900">paradise_yatra</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-800" />
            </div>

            {/* Post Image */}
            <div
              className="relative overflow-hidden bg-slate-100"
              style={{ aspectRatio: '4/5' }}
            >
              <img
                src={post.image}
                alt="Instagram post thumbnail"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="bg-white/0 group-hover:bg-white/20 backdrop-blur-0 group-hover:backdrop-blur-md p-3 rounded-full transition-all duration-300 transform scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                  <Instagram className="text-white w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Post Interactions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-4">
                  <Heart className="w-6 h-6 text-slate-800 hover:text-red-500 hover:fill-red-500 transition-all" />
                  <MessageCircle className="w-6 h-6 text-slate-800" />
                  <Send className="w-6 h-6 text-slate-800" />
                </div>
                <Bookmark className="w-6 h-6 text-slate-800 hover:fill-slate-800 transition-all" />
              </div>

              <div className="text-sm text-slate-800 mb-2 line-clamp-2 leading-relaxed">
                <span className="font-bold mr-2">paradise_yatra</span>
                {post.caption}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
