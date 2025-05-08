import {createSlice} from "@reduxjs/toolkit"

const initialState = {
    currentUser: null,
    loading: false,
    isAuthenticated: false,
    token: null,
    };


const authSlice = createSlice({
        name:"auth",
        initialState,
        reducers:{
            setLoading:(state, action) => {
                state.loading = action.payload;
            },
            setUser:(state, action) => {
                state.isAuthenticated = action.payload.isAuthenticated;
                state.token = action.payload.token;
                state.loading = false;
            },
            logOutUser:(state) => {
                state.currentUser = null;
                state.isAuthenticated = false;
                state.token = null;
                state.loading = false;
                localStorage.removeItem("token");
            }
        }
    });

export const { setLoading, setUser, logOutUser } = authSlice.actions;
 export default authSlice.reducer;