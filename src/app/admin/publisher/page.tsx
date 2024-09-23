import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { publisherGetMany, publisherGetOne, publisherCreateOne, publisherUpdateOne, publisherDeleteOne } from "~/server/queries"

import SearchPage from "~/app/admin/_components/search-page"

import { publisherValidationSchema, type PublisherSchemaType } from "~/server/validation"

type ModelAttrs = keyof PublisherSchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
    }
> = {
    name: {
        node: (field) => (
            <Input
                placeholder="Editora Campos Sales"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome da Editora.",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="editora"
            namePlural="editoras"
            tableHeaders={{
                id: "ID",
                name: "Nome",
            }}
            getManyQuery={publisherGetMany}
            deleteOneQuery={publisherDeleteOne}
            getOneQuery={publisherGetOne}
            createOneQuery={publisherCreateOne}
            updateOneQuery={publisherUpdateOne}
            inputKeyMap={inputKeyMap}
            formSchema={publisherValidationSchema}
        ></SearchPage>
    )
}
