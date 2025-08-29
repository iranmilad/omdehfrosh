import { useParams } from "react-router-dom";
import Archive from '../archive/index'

const ArchiveWrapper = () => {

  const { url } = useParams();

  return <Archive enabled={true} url={url} />;
};


export default ArchiveWrapper;