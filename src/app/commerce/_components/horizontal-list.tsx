"use client"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel"
import BookCard from "./book-card"
import { type BookClientSideState } from "~/lib/types"

export default function HorizontalList({ title, books }: { title: string; books: BookClientSideState[] }) {
    return (
        <section className="mb-10">
            <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
            <Carousel
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {books.map((book) => (
                        <CarouselItem
                            key={book.id}
                            className="pl-2 md:pl-4 max-w-[300px]"
                        >
                            <BookCard book={book}></BookCard>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselNext className="hidden md:flex"></CarouselNext>
                <CarouselPrevious className="hidden md:flex"></CarouselPrevious>
            </Carousel>
        </section>
    )
}
