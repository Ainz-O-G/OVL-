const { ovlcmd } = require("../framework/ovlcmd");
const axios = require("axios");
const ytsr = require('@distube/ytsr');

ovlcmd(
    {
        nom_cmd: "song",
        classe: "Téléchargement",
        react: "🎵",
        desc: "Télécharge une chanson depuis YouTube avec un terme de recherche ou un lien YouTube",
        alias: ["aud"],
    },
    async (ms_org, ovl, cmd_options) => {
        const { repondre, arg, ms } = cmd_options;

        if (!arg.length) {
            return await ovl.sendMessage(ms_org, { text: "Veuillez spécifier un titre de chanson ou un lien YouTube." });
        }

        const query = arg.join(" ");
        const isYouTubeLink = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(arg[0]);

        try {
            let videoInfo;

            if (isYouTubeLink) {
                videoInfo = { url: query }; // Si c'est un lien, on prend directement l'URL
            } else {
                const searchResults = await ytsr(query, { limit: 1 });
                if (searchResults.items.length === 0) {
                    return await ovl.sendMessage(ms_org, { text: "Aucun résultat trouvé pour cette recherche." });
                }
                const song = searchResults.items[0];
                videoInfo = {
                    url: song.url,
                    title: song.title, // Correction de 'name' à 'title'
                    views: song.views,
                    duration: song.duration,
                    thumbnail: song.bestThumbnail.url
                };
            }

            if (!videoInfo.url) {
                throw new Error("URL de la vidéo introuvable.");
            }

            const caption = `╭──── 〔 OVL-MD SONG 〕 ─⬣
⬡ Titre: ${videoInfo.title || "Titre non disponible"}
⬡ URL: ${videoInfo.url}
⬡ Vues: ${videoInfo.views || "Non disponible"}
⬡ Durée: ${videoInfo.duration || "Non disponible"}
╰────────⬣`;

            if (videoInfo.thumbnail) {
                await ovl.sendMessage(ms_org, { image: { url: videoInfo.thumbnail }, caption: caption });
            } else {
                await ovl.sendMessage(ms_org, { text: caption });
            }

            // Téléchargement de l'audio
            const audioResponse = await axios.get(`https://ironman.koyeb.app/ironman/dl/yta?url=${videoInfo.url}`, {
                responseType: 'arraybuffer'
            });

            await ovl.sendMessage(ms_org, {
                audio: Buffer.from(audioResponse.data),
                mimetype: 'audio/mp4',
                fileName: `${videoInfo.title || "audio"}.mp3`
            }, { quoted: ms });

        } catch (error) {
            console.error("Erreur lors du téléchargement de la chanson :", error.message || error);
            await ovl.sendMessage(ms_org, { text: "Erreur lors du téléchargement de la chanson." });
        }
    }
);

ovlcmd(
    {
        nom_cmd: "video",
        classe: "Téléchargement",
        react: "🎥",
        desc: "Télécharge une vidéo depuis YouTube avec un terme de recherche ou un lien YouTube"
    },
    async (ms_org, ovl, cmd_options) => {
        const { repondre, arg, ms } = cmd_options;

        if (!arg.length) {
            return await ovl.sendMessage(ms_org, { text: "Veuillez spécifier un titre de vidéo ou un lien YouTube." });
        }

        const query = arg.join(" ");
        const isYouTubeLink = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(arg[0]);

        try {
            let videoInfo;

            if (isYouTubeLink) {
                videoInfo = { url: query }; // Si c'est un lien, on prend directement l'URL
            } else {
                const searchResults = await ytsr(query, { limit: 1 });
                if (searchResults.items.length === 0) {
                    return await ovl.sendMessage(ms_org, { text: "Aucun résultat trouvé pour cette recherche." });
                }
                const video = searchResults.items[0];
                videoInfo = {
                    url: video.url,
                    title: video.title, // Correction de 'name' à 'title'
                    views: video.views,
                    duration: video.duration,
                    thumbnail: video.bestThumbnail.url
                };
            }

            if (!videoInfo.url) {
                throw new Error("URL de la vidéo introuvable.");
            }

            const caption = `╭──── 〔 OVL-MD VIDEO 〕 ─⬣
⬡ Titre: ${videoInfo.title || "Titre non disponible"}
⬡ URL: ${videoInfo.url}
⬡ Vues: ${videoInfo.views || "Non disponible"}
⬡ Durée: ${videoInfo.duration || "Non disponible"}
╰────────⬣`;

            if (videoInfo.thumbnail) {
                await ovl.sendMessage(ms_org, { image: { url: videoInfo.thumbnail }, caption: caption });
            } else {
                await ovl.sendMessage(ms_org, { text: caption });
            }

            // Téléchargement de la vidéo
            const videoResponse = await axios.get(`https://ironman.koyeb.app/ironman/dl/ytv?url=${videoInfo.url}`, {
                responseType: 'arraybuffer'
            });

            await ovl.sendMessage(ms_org, {
                video: Buffer.from(videoResponse.data),
                mimetype: 'video/mp4',
                fileName: `${videoInfo.title || "video"}.mp4`
            }, { quoted: ms });

        } catch (error) {
            console.error("Erreur lors du téléchargement de la vidéo :", error.message || error);
            await ovl.sendMessage(ms_org, { text: "Erreur lors du téléchargement de la vidéo." });
        }
    }
);
