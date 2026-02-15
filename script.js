// Discord ID'niz
const DISCORD_ID = "908743424717496320";

// --- Lanyard API (Discord Status) Entegrasyonu ---
async function fetchDiscordStatus() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await response.json();

        if (data.success) {
            updateDiscordUI(data.data);
        }
    } catch (error) {
        console.error("Discord verisi çekilemedi:", error);
    }
}

function updateDiscordUI(data) {
    const container = document.getElementById('discord-profile');
    const { discord_user, discord_status, activities } = data;

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

    // Aktivite kontrolü (Oyun veya Spotify)
    let activityHTML = "";
    if (activities.length > 0) {
        const activity = activities[0];
        activityHTML = `
            <div class="activity">
                <h5>Şu an ne yapıyor?</h5>
                <p><strong>${activity.name}</strong></p>
                <p>${activity.details || ""} ${activity.state || ""}</p>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="profile-wrapper">
            <div class="avatar-container">
                <img src="https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=256" alt="Avatar" class="avatar">
                <div class="status-dot" style="background-color: ${statusColors[discord_status]}"></div>
            </div>
            <div class="info">
                <h4>${discord_user.username}</h4>
                <p>${statusText[discord_status]}</p>
            </div>
        </div>
        ${activityHTML}
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
