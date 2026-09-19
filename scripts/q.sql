-- Ver projeto kairos-igreja e seus apps
SELECT a.name, a."appName", a."dockerImage", a.repository, a.owner, a.branch, a."applicationStatus", a."customGitUrl"
FROM application a
LIMIT 20;

-- ver todos os compose
SELECT "composeId", name, "appName", "composeType", "composeFile", repository, owner, branch, "customGitUrl", "composeStatus"
FROM compose;

-- ver todos os deployments recentes
SELECT title, status, "createdAt" FROM "deployment" ORDER BY "createdAt" DESC LIMIT 10;
