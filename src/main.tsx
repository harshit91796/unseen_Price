import * as React from "react";
import * as ReactDOM from "react-dom/client";
// import './Index.css';
import './assets/styles/initialSetup.scss';
import './assets/styles/setTupPage.scss';
import './assets/styles/cropper.scss';
import './assets/styles/feedMain.scss';
import './assets/styles/sigining.scss';
import './assets/styles/chats.scss';
import './assets/styles/userprofile.scss';
import '../src/index.css';

import { RouterProvider } from "react-router-dom";
import { router } from './routes';
import { store } from './redux/store'
import { Provider } from 'react-redux'
import LoadingScreen from './components/LoadingStartScreen';
import Navbar from "./components/navbar/Navbar";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 0); // Adjust this time as needed
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Provider store={ store}>
      <RouterProvider router={router as any} />
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Navbar/>
    <App />
  </React.StrictMode>
);