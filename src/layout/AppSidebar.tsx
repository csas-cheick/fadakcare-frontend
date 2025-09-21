import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import FadakCareLogo from "../images/fadakcare.png";

// Import icons from the existing icon library
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PieChartIcon,
  ChatIcon,
  AlertIcon,
  VideoIcon,
  CalendarGridIcon,
  LogoutIcon,
  DoctorIcon,
  MedicalTestIcon,
  PatientsGroupIcon,
  UserProfileIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Get user role from localStorage
const getUserRole = (): "admin" | "doctor" | "patient" => {
  const role = localStorage.getItem("userRole");
  return (role as "admin" | "doctor" | "patient") || "patient";
};

// Menu items for different roles
const getMenuItemsByRole = (role: "admin" | "doctor" | "patient"): NavItem[] => {
  const baseItems = [
    {
      icon: <GridIcon />,
      name: "Tableau de bord",
      path: `/home`,
    },
  ];

  const roleSpecificItems: Record<string, NavItem[]> = {
    admin: [
      {
        icon: <PatientsGroupIcon />,
        name: "Patients",
        path: "/admin/patients",
      },
      {
        icon: <DoctorIcon />,
        name: "Médecins", 
        path: "/admin/medecins",
      },
      {
        icon: <MedicalTestIcon />,
        name: "Dépistages",
        path: "/admin/depistage",
      },
      {
        icon: <AlertIcon />,
        name: "Alertes",
        path: "/admin/alertes",
      },
      {
        icon: <ChatIcon />,
        name: "Messagerie",
        path: "/messaging",
      },
      {
        icon: <CalenderIcon />,
        name: "Rendez-vous",
        path: "/admin/rendez-vous",
      },
      {
        icon: <VideoIcon />,
        name: "Télémédecine",
        path: "/admin/telemedecine",
      },
    ],
    doctor: [
      {
        icon: <PatientsGroupIcon />,
        name: "Patients",
        path: "/medecin/mes-patients",
      },
      {
        icon: <AlertIcon />,
        name: "Alertes",
        path: "/medecin/alerte",
      },
      {
        icon: <ChatIcon />,
        name: "Messagerie",
        path: "/messaging",
      },
      {
        icon: <CalenderIcon />,
        name: "Rendez-vous",
        path: "/medecin/rendez-vous",
      },
      {
        icon: <CalendarGridIcon />,
        name: "Mon Calendrier",
        path: "/medecin/calendrier",
      },
      {
        icon: <VideoIcon />,
        name: "Télémédecine",
        path: "/medecin/telemedecine",
      },
    ],
    patient: [
      {
        icon: <MedicalTestIcon />,
        name: "Dépistage",
        path: "/patient/depistage",
      },
      {
        icon: <PieChartIcon />,
        name: "Mes résultats",
        path: "/patient/resultats",
      },
      {
        icon: <DoctorIcon />,
        name: "Médecins",
        path: "/patient/medecin",
      },
      {
        icon: <AlertIcon />,
        name: "Alertes",
        path: "/patient/alerte",
      },
      {
        icon: <ChatIcon />,
        name: "Messagerie",
        path: "/messaging",
      },
      {
        icon: <CalenderIcon />,
        name: "Rendez-vous",
        path: "/patient/rendez-vous",
      },
      {
        icon: <CalendarGridIcon />,
        name: "Mon Calendrier",
        path: "/patient/calendrier",
      },
      {
        icon: <VideoIcon />,
        name: "Télémédecine",
        path: "/patient/telemedecine",
      },
    ],
  };

  return [...baseItems, ...roleSpecificItems[role]];
};

const profileItems: NavItem[] = [
  {
    icon: <UserProfileIcon />,
    name: "Mon compte",
    path: "/profile",
  },
  {
    icon: <LogoutIcon />,
    name: "Déconnexion",
    path: "/",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  
  // Get current user role
  const currentRole = getUserRole();
  const navItems = getMenuItemsByRole(currentRole);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "profile";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "profile"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : profileItems;
      items.forEach((nav: NavItem, index: number) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "profile",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "profile") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "profile") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              nav.name === "Déconnexion" ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("userRole");
                    localStorage.removeItem("userId");
                    window.location.href = "/login";
                  }}
                  className={`menu-item group w-full text-left ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </button>
              ) : (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center">
              <div className="w-12 h-12 overflow-hidden rounded-full border-2 border-teal-500 mr-3">
                <img src={FadakCareLogo} alt="FadakCare" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">FadakCare</h1>
            </div>
          ) : (
            <div className="w-12 h-12 overflow-hidden rounded-full border-2 border-teal-500">
              <img src={FadakCareLogo} alt="FadakCare" className="w-full h-full object-cover" />
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu Principal"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Profil"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(profileItems, "profile")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
