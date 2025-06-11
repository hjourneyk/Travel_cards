// Audio Control Functionality
class AudioController {
    constructor() {
        this.audioElement = document.getElementById('backgroundAudio');
        this.toggleButton = document.getElementById('audioToggle');
        this.audioIcon = document.getElementById('audioIcon');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.restartButton = document.getElementById('restartButton');
        this.volumeIcon = document.getElementById('volumeIcon');
        this.isPlaying = false;
        this.currentVolume = 0.3;
        
        this.initializeAudio();
        this.bindEvents();
    }
    
    initializeAudio() {
        this.audioElement.volume = this.currentVolume;
        if (this.volumeSlider) {
            this.volumeSlider.value = this.currentVolume * 100;
        }
        
        if (typeof(Audio) !== "undefined") {
            this.createAudioBuffer();
        }
    }
    
    createAudioBuffer() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            gainNode.gain.setValueAtTime(this.currentVolume * 0.3, audioContext.currentTime);
            
            this.audioContext = audioContext;
            this.oscillator = oscillator;
            this.gainNode = gainNode;
        } catch (error) {
            console.log('Audio context not supported');
        }
    }
    
    bindEvents() {
        this.toggleButton.addEventListener('click', () => this.toggleAudio());
        
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => this.handleVolumeChange(e));
        }
        
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => this.restartAudio());
        }
        
        this.audioElement.addEventListener('ended', () => this.handleAudioEnd());
        this.audioElement.addEventListener('error', () => this.handleAudioError());
        this.audioElement.addEventListener('loadedmetadata', () => this.updateProgress());
    }
    
    toggleAudio() {
        if (this.isPlaying) {
            this.stopAudio();
        } else {
            this.playAudio();
        }
    }
    
    playAudio() {
        try {
            this.audioElement.play().then(() => {
                this.updatePlayingState(true);
            }).catch(() => {
                this.playWebAudio();
            });
        } catch (error) {
            this.playWebAudio();
        }
    }
    
    playWebAudio() {
        if (this.audioContext && this.oscillator) {
            try {
                this.audioContext.resume();
                this.oscillator.start();
                this.updatePlayingState(true);
            } catch (error) {
                console.log('Web Audio not supported');
                this.showAudioMessage();
            }
        } else {
            this.showAudioMessage();
        }
    }
    
    stopAudio() {
        try {
            this.audioElement.pause();
        } catch (error) {
            console.log('Audio stop error');
        }
        
        if (this.audioContext && this.oscillator) {
            try {
                this.oscillator.stop();
                this.audioContext.close();
            } catch (error) {
                console.log('Web Audio stop error');
            }
        }
        
        this.updatePlayingState(false);
    }
    
    restartAudio() {
        try {
            this.audioElement.currentTime = 0;
            if (this.isPlaying) {
                this.audioElement.play();
            }
        } catch (error) {
            console.log('Audio restart error');
        }
        
        if (this.audioContext && this.isPlaying) {
            try {
                if (this.oscillator) {
                    this.oscillator.stop();
                }
                this.createAudioBuffer();
                this.playWebAudio();
            } catch (error) {
                console.log('Web Audio restart error');
            }
        }
    }
    
    handleVolumeChange(event) {
        const volume = event.target.value / 100;
        this.currentVolume = volume;
        
        this.audioElement.volume = volume;
        
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
        }
        
        this.updateVolumeIcon(volume);
    }
    
    updateVolumeIcon(volume) {
        if (!this.volumeIcon) return;
        
        if (volume === 0) {
            this.volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            this.volumeIcon.className = 'fas fa-volume-down';
        } else {
            this.volumeIcon.className = 'fas fa-volume-up';
        }
    }
    
    updatePlayingState(playing) {
        this.isPlaying = playing;
        this.audioIcon.className = playing ? 'fas fa-pause' : 'fas fa-play';
        this.toggleButton.querySelector('span').textContent = 
            playing ? 'Pause Music' : 'Play Music';
            
        if (this.restartButton) {
            this.restartButton.disabled = !playing;
            this.restartButton.style.opacity = playing ? '1' : '0.5';
        }
    }
    
    handleAudioEnd() {
        this.updatePlayingState(false);
    }
    
    handleAudioError() {
        console.log('Audio playback error');
        this.showAudioMessage();
    }
    
    showAudioMessage() {
        this.toggleButton.querySelector('span').textContent = 'Audio Not Available';
        setTimeout(() => {
            this.toggleButton.querySelector('span').textContent = 'Play Travel Sounds';
        }, 2000);
    }
    
    updateProgress() {
        if (this.audioElement.duration) {
            console.log(`Audio duration: ${this.audioElement.duration} seconds`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const audioController = new AudioController();
    console.log('🎵 Enhanced Audio Controller loaded successfully!');
});

// Card Animation Controller - Modified for static display
class CardAnimationController {
    constructor() {
        this.cards = document.querySelectorAll('.travel-card');
        this.initializeStaticDisplay();
    }
    
    initializeStaticDisplay() {
        // Show all cards immediately without scroll-based animation
        this.cards.forEach((card, index) => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = 'all 0.6s ease';
            card.style.transitionDelay = `${index * 0.1}s`;
        });
    }
}

// Responsive Grid Controller
class ResponsiveGridController {
    constructor() {
        this.grid = document.getElementById('cardsGrid');
        this.handleResize();
        this.bindResizeEvents();
    }
    
    bindResizeEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }
    
    handleResize() {
        const width = window.innerWidth;
        
        if (width >= 1200) {
            this.grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else if (width >= 768) {
            this.grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            this.grid.style.gridTemplateColumns = '1fr';
        }
    }
}

// Glassmorphism Effect Controller
class GlassmorphismController {
    constructor() {
        this.cards = document.querySelectorAll('.travel-card');
        this.bindHoverEvents();
    }
    
    bindHoverEvents() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => this.enhanceGlass(e.target));
            card.addEventListener('mouseleave', (e) => this.normalizeGlass(e.target));
        });
    }
    
    enhanceGlass(card) {
        card.style.background = 'rgba(255, 255, 255, 0.25)';
        card.style.backdropFilter = 'blur(20px)';
        card.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    }
    
    normalizeGlass(card) {
        card.style.background = 'rgba(255, 255, 255, 0.15)';
        card.style.backdropFilter = 'blur(15px)';
        card.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
}

// Initialize all controllers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    const audioController = new AudioController();
    const cardAnimationController = new CardAnimationController();
    const responsiveGridController = new ResponsiveGridController();
    const glassmorphismController = new GlassmorphismController();
    
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Console message for developers
    console.log('🌍 Travel Memories Mashup loaded successfully!');
    console.log('✨ Features: Responsive Grid, Glassmorphism, Audio Control, Static Display');
});


// Performance optimization
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Preload images for better performance
        const imageUrls = [
            'https://images.unsplash.com/photo-1539650116574-75c0c6d6bd5c?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=250&fit=crop'
        ];
        
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    });
}

class VideoController {
    constructor(videoId) {
        this.video = document.getElementById(videoId);
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playPauseIcon = document.getElementById('playPauseIcon');
        this.muteBtn = document.getElementById('muteBtn');
        this.muteIcon = document.getElementById('muteIcon');
        this.progressFill = document.getElementById('progressFill');
        this.progressContainer = document.querySelector('.video-progress-container');
        
        this.isPlaying = false;
        this.isMuted = true;
        
        this.initializeVideo();
        this.bindEvents();
    }
    
    initializeVideo() {
        // Ensure video is muted and stopped initially
        this.video.muted = true;
        this.video.currentTime = 0;
        this.updatePlayPauseIcon();
        this.updateMuteIcon();
    }
    
    bindEvents() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Mute button
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // Progress bar click
        this.progressContainer.addEventListener('click', (e) => this.seekVideo(e));
        
        // Video events
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('ended', () => this.handleVideoEnd());
        this.video.addEventListener('loadedmetadata', () => this.updateProgress());
        
        // Double click to toggle fullscreen
        this.video.addEventListener('dblclick', () => this.toggleFullscreen());
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.video.pause();
            this.isPlaying = false;
        } else {
            this.video.play();
            this.isPlaying = true;
        }
        this.updatePlayPauseIcon();
    }
    
    toggleMute() {
        this.video.muted = !this.video.muted;
        this.isMuted = this.video.muted;
        this.updateMuteIcon();
    }
    
    seekVideo(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        const newTime = percentage * this.video.duration;
        
        if (!isNaN(newTime)) {
            this.video.currentTime = newTime;
        }
    }
    
    updateProgress() {
        if (this.video.duration) {
            const percentage = (this.video.currentTime / this.video.duration) * 100;
            this.progressFill.style.width = percentage + '%';
        }
    }
    
    updatePlayPauseIcon() {
        this.playPauseIcon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
    
    updateMuteIcon() {
        this.muteIcon.className = this.isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }
    
    handleVideoEnd() {
        this.isPlaying = false;
        this.updatePlayPauseIcon();
        // Reset to beginning for loop effect
        this.video.currentTime = 0;
    }
    
    toggleFullscreen() {
        if (this.video.requestFullscreen) {
            this.video.requestFullscreen();
        } else if (this.video.webkitRequestFullscreen) {
            this.video.webkitRequestFullscreen();
        } else if (this.video.mozRequestFullScreen) {
            this.video.mozRequestFullScreen();
        }
    }
}

// Initialize video controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const videoController = new VideoController('phuquocVideo');
    console.log('🎬 Video controller initialized!');
});