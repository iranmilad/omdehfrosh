import { useState } from "react";
import { Input } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"


const Search = () => {
    const [focused, setFocused] = useState(false);
    const [value,setValue] = useState("");
    return (
        <div>
            <Input variant="filled"  value={value} onChange={(e) => setValue(e.target.value)} onFocus={() => setFocused(true)} w={500} size="md" leftSection={<IconSearch size={18} />} placeholder="جستجو ..."/>
        </div>
    )
}

export default Search