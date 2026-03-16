/**
 * Reusable icon components wrapping react-icons.
 * Centralizes icon usage so we can swap libraries or sizes in one place.
 */
import {
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCalendar,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiCamera,
  FiFile,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { LuImagePlus } from 'react-icons/lu';

export function EditIcon({ className = '', size = 18 }) {
  return <FiEdit2 className={className} size={size} />;
}
export function DeleteIcon({ className = '', size = 18 }) {
  return <FiTrash2 className={className} size={size} />;
}
export function SearchIcon({ className = '', size = 18 }) {
  return <FiSearch className={className} size={size} />;
}
export function CalendarIcon({ className = '', size = 18 }) {
  return <FiCalendar className={className} size={size} />;
}
export function ClockIcon({ className = '', size = 18 }) {
  return <FiClock className={className} size={size} />;
}
export function ChevronLeftIcon({ className = '', size = 18 }) {
  return <FiChevronLeft className={className} size={size} />;
}
export function ChevronRightIcon({ className = '', size = 18 }) {
  return <FiChevronRight className={className} size={size} />;
}
export function CameraIcon({ className = '', size = 48 }) {
  return <FiCamera className={className} size={size} />;
}
export function ImagePlusIcon({ className = '', size = 48 }) {
  return <LuImagePlus className={className} size={size} />;
}
export function FileIcon({ className = '', size = 18 }) {
  return <FiFile className={className} size={size} />;
}
export function PersonIcon({ className = '', size = 18 }) {
  return <FiUser className={className} size={size} />;
}
export function CloseIcon({ className = '', size = 18 }) {
  return <FiX className={className} size={size} />;
}
