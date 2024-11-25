import Providers from "./Providers"
import appConfig from "./config/app.config";
import mockServer from "./mock";

// Run mock server
let environment = import.meta.env.MODE;
if (environment !== "production" && appConfig.enableMock) {
	mockServer({ environment });
}

function App (){
  return (
    <Providers />
  )
}

export default App