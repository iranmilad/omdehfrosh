import { useEditor } from '@craftjs/core'
import { Button } from '@mantine/core'
import lz from 'lzutf8';

function Save() {
    const {query} = useEditor();
    const click = () => {
        let json = query.serialize();
        json = lz.encodeBase64(lz.compress(json));
        console.log(json);
    }
  return (
    <Button size="xs" h={35} onClick={click}>ذخیره</Button>
  )
}

export default Save