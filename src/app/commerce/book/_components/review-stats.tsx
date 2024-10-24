import { Star } from "lucide-react"

export default function ReviewStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
            ))}
        </div>
    )
}
