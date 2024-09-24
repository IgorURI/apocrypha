import { db } from "~/server/db"
import { getMany, getOne, createOne, updateOne, deleteOne } from "~/server/generic-queries"
import {
    type AuthorPayload,
    type CategoryPayload,
    type CurrencyPayload,
    type LanguagePayload,
    type PublisherPayload,
    type SeriesPayload,
    type TranslatorPayload,
    type CategoryInput,
    type PublisherInput,
    type LanguageInput,
    type SeriesInput,
    type CurrencyInput,
    type AuthorInput,
    type TranslatorInput,
    type CommonDBReturn,
} from "~/server/types"

export const currencyGetMany = getMany<CurrencyPayload>(db.currency, "iso4217Code")
export const currencyGetOne = getOne<CurrencyInput>(db.currency)
export const currencyCreateOne = createOne<CurrencyInput>(db.currency, "currency")
export const currencyUpdateOne = updateOne<CurrencyInput>(db.currency, "currency")
export const currencyDeleteOne = deleteOne(db.currency, "currency")

export const authorGetMany = getMany<AuthorPayload>(db.author, "name")
export const authorGetOne = getOne<AuthorInput>(db.author)
export const authorCreateOne = createOne<AuthorInput>(db.author, "author")
export const authorUpdateOne = updateOne<AuthorInput>(db.author, "author")
export const authorDeleteOne = deleteOne(db.author, "author")

export const translatorGetMany = getMany<TranslatorPayload>(db.translator, "name")
export const translatorGetOne = getOne<TranslatorInput>(db.translator)
export const translatorCreateOne = createOne<TranslatorInput>(db.translator, "translator")
export const translatorUpdateOne = updateOne<TranslatorInput>(db.translator, "translator")
export const translatorDeleteOne = deleteOne(db.translator, "translator")

export const publisherGetMany = getMany<PublisherPayload>(db.publisher, "name")
export const publisherGetOne = getOne<PublisherInput>(db.publisher)
export const publisherCreateOne = createOne<PublisherInput>(db.publisher, "publisher")
export const publisherUpdateOne = updateOne<PublisherInput>(db.publisher, "publisher")
export const publisherDeleteOne = deleteOne(db.publisher, "publisher")

export const seriesGetMany = getMany<SeriesPayload>(db.series, "name")
export const seriesGetOne = getOne<SeriesInput>(db.series)
export const seriesCreateOne = createOne<SeriesInput>(db.series, "series")
export const seriesUpdateOne = updateOne<SeriesInput>(db.series, "series")
export const seriesDeleteOne = deleteOne(db.series, "series")

export const categoryGetMany = getMany<CategoryPayload>(db.category, "name")
export const categoryGetOne = getOne<CategoryInput>(db.category)
export const categoryCreateOne = createOne<CategoryInput>(db.category, "category")
export const categoryUpdateOne = updateOne<CategoryInput>(db.category, "category")
export const categoryDeleteOne = deleteOne(db.category, "category")

export const languageGetMany = getMany<LanguagePayload>(db.language, "name")
export const languageGetOne = getOne<LanguageInput>(db.language)
export const languageCreateOne = createOne<LanguageInput>(db.language, "language")
export const languageUpdateOne = updateOne<LanguageInput>(db.language, "language")
export const languageDeleteOne = deleteOne(db.language, "language")

export async function GET(_: Request, { params: { slug, id } }: { params: { slug: string; id: string } }) {
    console.log("slug", slug)
    console.log("id", id)
    let dbQuery: (id: string) => Promise<CommonDBReturn<unknown>>
    switch (slug) {
        case "currency":
            dbQuery = currencyGetOne
            break
        case "author":
            dbQuery = authorGetOne
            break
        case "translator":
            dbQuery = translatorGetOne
            break
        case "publisher":
            dbQuery = publisherGetOne
            break
        case "series":
            dbQuery = seriesGetOne
            break
        case "category":
            dbQuery = categoryGetOne
            break
        case "language":
            dbQuery = languageGetOne
            break
        default:
            dbQuery = async () => {
                return {
                    data: undefined,
                    success: false,
                    errorMessage: "Invalid slug",
                }
            }
    }

    const result = await dbQuery(id)

    if (!result.success) {
        return Response.json(
            {
                errorMessage: result.errorMessage,
            },
            {
                status: 500,
            },
        )
    }

    return Response.json(result.data)
}