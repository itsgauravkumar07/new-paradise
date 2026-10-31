// Traveller video testimonials (files live in public/Home/Memories by travellers).
// Used by TestimonialsSection, and as the home page "Traveller moments" until the team adds
// photos and videos in Admin → Customer Gallery (lib/customerMoments.ts).

export interface VideoTestimonial {
    id: number;
    destination: string;
    video: string;
    quote: string;
    name: string;
    /** Star rating; not shown when missing (gallery videos have none) */
    rating?: number;
}

export const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
    {
        id: 1,
        destination: "Goa",
        video: "/Home/Memories by travellers/Video Testimonial 1.mp4",
        quote: "Absolutely phenomenal experience! Everything was perfectly arranged.",
        name: "Rahul Sharma",
        rating: 5,
    },
    {
        id: 2,
        destination: "Gujarat",
        video: "/Home/Memories by travellers/Video Testimonial 2.mp4",
        quote: "A trip we will remember forever. Highly recommended!",
        name: "Roobal & Anjali",
        rating: 5,
    },
    {
        id: 3,
        destination: "Kerala",
        video: "/Home/Memories by travellers/Video Testimonial 3.mp4",
        quote: "The backwaters were magical. Thank you Paradise Yatra!",
        name: "Vikram Singh",
        rating: 5,
    },
    {
        id: 4,
        destination: "Sikkim",
        video: "/Home/Memories by travellers/Video Testimonial 4.mp4",
        quote: "Amazing hospitality and breathtaking views.",
        name: "Pranav & Anjali",
        rating: 5,
    },
    {
        id: 5,
        destination: "Shimla",
        video: "/Home/Memories by travellers/Video Testimonial 5.mp4",
        quote: "Perfect family getaway with zero hassle. 10/10!",
        name: "The Kapoor Family",
        rating: 5,
    },
];
