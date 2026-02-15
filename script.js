// Discord ID'niz
const DISCORD_ID = "908743424717496320";

// --- Lanyard API (Discord Status) Entegrasyonu ---
async function fetchDiscordStatus() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        if (!response.ok) {
            if (response.status === 404) {
                showDiscordError("Kullanıcı Lanyard sunucusunda bulunamadı. Lütfen discord.gg/lanyard adresine katıldığından emin olun.");
                return;
            }
            throw new Error(`API Hatası: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
            updateDiscordUI(data.data);
        }
    } catch (error) {
        console.error("Discord verisi çekilemedi:", error);
        showDiscordError("Discord bağlantısı şu an kurulamıyor.");
    }
}

function showDiscordError(message) {
    const container = document.getElementById('discord-profile');
    container.innerHTML = `
        <div class="discord-error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

function updateDiscordUI(data) {
    const container = document.getElementById('discord-profile');
    const { discord_user, discord_status, activities, listening_to_spotify, spotify } = data;

    // Durum renkleri ve metinleri
    const statusColors = {
        online: "#22c55e",
        idle: "#f59e0b",
        dnd: "#ef4444",
        offline: "#64748b"
    };

    const statusText = {
        online: "Çevrimiçi",
        idle: "Boşta",
        dnd: "Rahatsız Etmeyin",
        offline: "Çevrimdışı"
    };

    // Profil Fotoğrafı (GIF avatar desteği için avatar hash kontrolü)
    const avatarHash = discord_user.avatar;
    const isAnimated = avatarHash && avatarHash.startsWith('a_');
    const avatarUrl = avatarHash
        ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${avatarHash}.${isAnimated ? 'gif' : 'webp'}?size=512`
        : `https://cdn.discordapp.com/embed/avatars/${discord_user.discriminator % 5}.png`;

    // Spotify Kartı
    let spotifyHTML = "";
    if (listening_to_spotify && spotify) {
        spotifyHTML = `
            <div class="spotify-track">
                <div class="spotify-header">
                    <i class="fab fa-spotify"></i>
                    <span>Spotify Dinliyor</span>
                </div>
                <div class="spotify-content">
                    <img src="${spotify.album_art_url}" alt="Album Art" class="album-art">
                    <div class="spotify-info">
                        <div class="song-name">${spotify.song}</div>
                        <div class="artist-name">${spotify.artist}</div>
                    </div>
                    <div class="spotify-wave">
                        <span></span><span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
    }

    // Diğer Aktiviteler
    let otherActivityHTML = "";
    if (!listening_to_spotify && activities.length > 0) {
        const activity = activities.find(a => a.type !== 4); // Custom status (type 4) hariç ilk aktivite
        if (activity) {
            otherActivityHTML = `
                <div class="activity">
                    <h5>Şu an ne yapıyor?</h5>
                    <div class="activity-content">
                        ${activity.assets && activity.assets.large_image
                    ? `<img src="https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png" class="activity-img">`
                    : `<div class="activity-icon"><i class="fas fa-gamepad"></i></div>`
                }
                        <div class="activity-details">
                            <p class="activity-name"><strong>${activity.name}</strong></p>
                            <p class="activity-text">${activity.details || ""} ${activity.state || ""}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    container.innerHTML = `
        <div class="profile-wrapper">
            <div class="avatar-container">
                <img src="${avatarUrl}" alt="Avatar" class="avatar">
                <div class="status-dot" style="background-color: ${statusColors[discord_status] || statusColors.offline}"></div>
            </div>
            <div class="info">
                <h4>${discord_user.global_name || discord_user.username}</h4>
                <p class="discord-tag">@${discord_user.username}</p>
                <div class="status-text-row">
                    <span class="status-name">${statusText[discord_status] || "Bilinmiyor"}</span>
                </div>
            </div>
        </div>
        ${spotifyHTML}
        ${otherActivityHTML}
    `;
}

// --- Kaydırma Animasyonları (Reveal on Scroll) ---
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

// Tüm reveal sınıfına sahip öğeleri izle
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Discord verisini çek
    fetchDiscordStatus();
    // Her 30 saniyede bir güncelle
    setInterval(fetchDiscordStatus, 30000);
});

// Navbar Kaydırma Efekti
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 10%';
        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    } else {
        nav.style.padding = '2rem 10%';
        nav.style.boxShadow = 'none';
    }
});
