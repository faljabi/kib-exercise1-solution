const { v4: uuidv4 } = require('uuid');
const axios = require('axios').default;

const firebaseAdmin = require('../../firebase/admin/firebase-admin');
const db = firebaseAdmin.firestore();

const reset = async _ => {

    const FAKE_USERS_URL = 'https://jsonplaceholder.typicode.com/users';

    const batch = db.batch();

    return axios
        .get(FAKE_USERS_URL)
        .then(response => {

            return db.collection('users').listDocuments().then(users => {

                users.map(user => batch.delete(user));

                response.data.forEach(user => {

                    let userId = uuidv4();

                    let userRef = db.collection('users').doc(userId);
                    batch.set(userRef, { ...user, id: userId });
                });

                return batch
                    .commit()
                    .then(_ => true)
                    .catch(error => {

                        throw new Error(`Failed to reset users: ${error.message}`);
                    });
            });
        })
        .catch(error => {

            throw new Error(`Failed to reset users: ${error.message}`);
        });
}

const searchUsers = async _ => {

    try {

        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();

        if (snapshot.empty) return [];

        const users = [];

        snapshot.forEach(user => users.push(user.data()));

        return users;
    }
    catch (error) {

        throw new Error(`Failed to fetch users: ${error.message}`);
    }
}

const upsertUser = async user => {

    return await db.collection('users').doc(user.id.toString()).set(user)

        .then(_ => true)
        .catch(error => {

            throw new Error(`Failed to add user: ${error.message}`);
        });
}

const deleteUser = async user => {

    return await db.collection('users').doc(user.id.toString()).delete()

        .then(_ => true)
        .catch(error => {

            throw new Error(`Failed to delete user: ${error.message}`);
        });
}

const UsersDataManager = {
    reset,
    searchUsers,
    upsertUser,
    deleteUser
}

module.exports = UsersDataManager;