import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import {
  categoriesStateUpwrapped,
  loadableUserInfoState,
  userInfoState,
} from "@/state";
import { useMemo } from "react";
import { useRouteHandle } from "@/hooks";
import { getConfig } from "@/utils/template";
import headerIllus from "@/static/header-illus.svg";
import TransitionLink from "./transition-link";
import { Icon } from "zmp-ui";

export default function Header() {
  const categories = useAtomValue(categoriesStateUpwrapped);
  const navigate = useNavigate();
  const location = useLocation();
  const [handle, match] = useRouteHandle();
  const userInfo = useAtomValue(loadableUserInfoState);

  const title = useMemo(() => {
    if (handle) {
      if (typeof handle.title === "function") {
        return handle.title({ categories, params: match.params });
      } else {
        return handle.title;
      }
    }
  }, [handle, categories]);

  const showBack = !handle?.noBack && (location.key !== "default" || handle?.backRoute);

  return (
    <div
      className="w-full flex flex-col px-4 bg-primary text-primaryForeground pt-st overflow-hidden bg-no-repeat bg-right-top"
      style={{
        backgroundImage: `url(${headerIllus})`,
      }}
    >
      <div className="w-full min-h-12 pr-[90px] flex py-2 space-x-2 items-center">
        {handle?.logo ? (
          <>
            <img
              src={getConfig((c) => c.template.logoUrl)}
              className="flex-none w-8 h-8 rounded-full"
            />
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center space-x-1">
                <h1 className="text-lg font-bold">
                  Thu mua phế liệu
                </h1>
              </div>
              <p className="overflow-x-auto whitespace-nowrap text-2xs">
                Dịch vụ thu gom tận nơi, uy tín
              </p>
            </div>
          </>
        ) : (
          <>
            {showBack && (
              <div
                className="py-1 px-2 cursor-pointer"
                onClick={() => {
                  if (handle?.backRoute) {
                    navigate(handle.backRoute);
                  } else {
                    navigate(-1);
                  }
                }}
              >
                <Icon icon="zi-arrow-left" />
              </div>
            )}
            <div className="text-xl font-medium truncate">{title}</div>
          </>
        )}
      </div>
    </div>
  );
}
