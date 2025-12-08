import Providers from "./Providers"
import appConfig from "./config/app.config";
import mockServer from "./mock";
import 'bootstrap-icons/font/bootstrap-icons.css';


// Run mock server
let environment = import.meta.env.MODE;
if (environment === "development" && process.env.VITE_MODE === "development") {
  mockServer({ environment });
}


function App (){
  return (
    <Providers />
  )
}

export default App