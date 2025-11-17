import { type AppProps } from "next/app";
import { Geist } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { Toaster } from "~/components/ui/sonner";

const geist = Geist({
  subsets: ["latin"],
});

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ClerkProvider
      {...pageProps}
      appearance={{
        cssLayerName: "clerk",
      }}
    >
      <div className={geist.className}>
        <Toaster richColors position="bottom-right" />
        {getLayout(<Component {...pageProps} />)}
      </div>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
