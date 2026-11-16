import { useEffect, useState } from "react"
import { AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useDispatch, useSelector } from "react-redux"
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom"

import { NavbarLinks } from "../../data/navbar-links"
import { sidebarLinks } from "../../data/dashboard-links"
import { apiConnector } from "../../services/apiconnector"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ConfirmationModal from "./ConfirmationModal"
import ProfileDropdown from "../core/Auth/ProfileDropDown"
import { logout } from "../../services/operations/authAPI"

export default function SmallScreenNavbar({ handleCrossButton }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [catalogOpen, setCatalogOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const onNavigate = () => {
    handleCrossButton()
  }

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 top-14 z-[999] bg-black/50 md:hidden"
        onClick={handleCrossButton}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-14 z-[1000] flex h-[calc(100vh-3.5rem)] w-full max-w-xs flex-col overflow-y-auto border-l border-richblack-700 px-5 py-6 md:hidden ${
          location.pathname !== "/" ? "bg-richblack-800" : "bg-richblack-900"
        }`}
      >
        {/* Auth / cart */}
        <div className="mb-6 flex flex-col items-stretch gap-3">
          <div className="flex items-center justify-end gap-4">
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative" onClick={onNavigate}>
                <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {token !== null && <ProfileDropdown />}
          </div>

          {token === null && (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={onNavigate}>
                <button className="w-full rounded-[8px] border border-richblack-700 bg-richblack-800 px-3 py-2 text-richblack-100">
                  Log in
                </button>
              </Link>
              <Link to="/signup" onClick={onNavigate}>
                <button className="w-full rounded-[8px] border border-richblack-700 bg-richblack-800 px-3 py-2 text-richblack-100">
                  Sign up
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="mb-4 h-px w-full bg-richblack-700" />

        {/* Dashboard links when logged in */}
        {token !== null && (
          <>
            <nav className="mb-4">
              <ul className="flex flex-col gap-3 text-richblack-25">
                {sidebarLinks.map((link) => {
                  if (link.name === "My Profile") {
                    return (
                      <li key={link.id}>
                        <Link to={link.path} onClick={onNavigate}>
                          <p
                            className={
                              matchRoute(link.path)
                                ? "text-yellow-25"
                                : "text-richblack-25"
                            }
                          >
                            {link.name}
                          </p>
                        </Link>
                      </li>
                    )
                  }
                  if (link?.type === user?.accountType) {
                    return (
                      <li key={link.id}>
                        <Link to={link.path} onClick={onNavigate}>
                          <p
                            className={
                              matchRoute(link.path)
                                ? "text-yellow-25"
                                : "text-richblack-25"
                            }
                          >
                            {link.name}
                          </p>
                        </Link>
                      </li>
                    )
                  }
                  return null
                })}
                <li>
                  <Link to="/dashboard/settings" onClick={onNavigate}>
                    <p
                      className={
                        matchRoute("/dashboard/settings")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }
                    >
                      Settings
                    </p>
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-left text-richblack-25"
                    onClick={() =>
                      setConfirmationModal({
                        text1: "Are you sure?",
                        text2: "You will be logged out of your account.",
                        btn1Text: "Logout",
                        btn2Text: "Cancel",
                        btn1Handler: () => dispatch(logout(navigate)),
                        btn2Handler: () => setConfirmationModal(null),
                      })
                    }
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
            <div className="mb-4 h-px w-full bg-richblack-700" />
          </>
        )}

        {/* Main nav links */}
        <nav>
          <ul className="flex flex-col gap-4 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                      onClick={() => setCatalogOpen((open) => !open)}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown
                        className={`transition-transform ${
                          catalogOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {catalogOpen && (
                      <div className="mt-3 flex flex-col gap-2 rounded-lg bg-richblack-5 p-3 text-richblack-900">
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : subLinks.length ? (
                          subLinks.map((subLink, i) => (
                            <Link
                              key={i}
                              to={`/catalog/${subLink.name
                                .split(" ")
                                .join("-")
                                .toLowerCase()}`}
                              className="rounded-lg px-2 py-2 hover:bg-richblack-50"
                              onClick={onNavigate}
                            >
                              <p>{subLink.name}</p>
                            </Link>
                          ))
                        ) : (
                          <p className="text-center">No Course Found</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to={link?.path} onClick={onNavigate}>
                    <p
                      className={
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {confirmationModal && (
        <ConfirmationModal modalData={confirmationModal} />
      )}
    </>
  )
}
