/// <reference path="../pb_data/types.d.ts" />

/**
 * Mocks Manager for PocketBase
 * Registers custom console commands to upsert and delete mock users.
 * 
 * Usage:
 * pocketbase upsert-mock-data
 * pocketbase delete-mock-data
 */

$app.rootCmd.addCommand(new Command({
    use: "upsert-mock-data",
    short: "Inserts or updates mock users, profiles and permissions",
    run: (cmd, args) => {
        const usersCol = $app.findCollectionByNameOrId("users");
        const profilesCol = $app.findCollectionByNameOrId("profiles");
        const accessesCol = $app.findCollectionByNameOrId("accesses");
        const MOCK_PASSWORD = "demo123456";

        // Chargement du fichier JSON synchronisé
        const raw = $os.readFile("/srv/pb_hooks/mock-users.json");
        const mockData = JSON.parse(String.fromCharCode(...raw));

        // 1. Upsert Users
        mockData.users.forEach(userData => {
            let user;
            try {
                user = $app.findRecordById("users", userData.id);
            } catch (e) {
                user = new Record(usersCol);
                user.set("id", userData.id);
            }

            user.set("email", userData.email);
            user.set("name", userData.name);
            user.set("role", "Allergique");
            user.set("themePreference", "classic");
            user.set("verified", true);
            user.setPassword(MOCK_PASSWORD);
            
            $app.save(user);
            console.log(`Upserted user: ${userData.email}`);
        });

        // 2. Upsert Profiles
        mockData.profiles.forEach(profData => {
            let profile;
            try {
                profile = $app.findRecordById("profiles", profData.id);
            } catch (e) {
                profile = new Record(profilesCol);
                profile.set("id", profData.id);
            }

            profile.set("name", profData.name);
            profile.set("themePreference", profData.themePreference);
            profile.set("birthDate", profData.birthDate);
            profile.set("onboardingStep", profData.onboardingStep || "completed");

            $app.save(profile);
            console.log(`Upserted profile: ${profData.name}`);
        });

        // 3. Upsert Accesses
        mockData.accesses.forEach(accessData => {
            let access;
            try {
                access = $app.findFirstRecordByFilter("accesses", "userId = {:userId} && profileId = {:profileId}", {
                    userId: accessData.userId,
                    profileId: accessData.profileId
                });
            } catch (e) {
                access = new Record(accessesCol);
                access.set("userId", accessData.userId);
                access.set("profileId", accessData.profileId);
            }
            access.set("role", accessData.role); 
            $app.save(access);
            console.log(`Set access: ${accessData.userId} -> ${accessData.profileId} (${accessData.role})`);
        });

        console.log("Successfully upserted all relational mock data!");
    }
}));

$app.rootCmd.addCommand(new Command({
    use: "delete-mock-data",
    short: "Deletes all mock users and their owned profiles",
    run: (cmd, args) => {
        // We delete users, and cascadeDelete will handle profiles and accesses
        const mockUserIds = [
            "usermock0000001", "usermock0000002", "usermock0000003", 
            "usermock0000004", "usermock0000005", "usermock0000006"
        ];

        mockUserIds.forEach(id => {
            try {
                const user = $app.findRecordById("users", id);
                $app.delete(user);
                console.log(`Deleted user: ${id}`);
            } catch (e) {
                // Ignore if user not found
            }
        });

        console.log("Successfully deleted all mock data!");
    }
}));
