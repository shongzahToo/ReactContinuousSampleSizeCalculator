// InputContext.js
import { createContext, useContext } from 'react';

export const InputContext = createContext();

export const useInput = () => useContext(InputContext);
