/**
 * @description Task actions for SalesFlow, independent of Lightning UI.
 * The first closed status comes from the running org (no hard-coded label).
 * DML is performed in USER_MODE; never elevates the caller's permissions.
 */
public with sharing class SalesFlowTaskService {
    public static void complete(Id taskId) {
        if (taskId == null) {
            throw new AuraHandledException('A tarefa é obrigatória.');
        }

        List<TaskStatus> closedStatuses = [
            SELECT ApiName FROM TaskStatus
            WHERE IsClosed = true ORDER BY SortOrder ASC LIMIT 1
        ];
        if (closedStatuses.isEmpty()) {
            throw new AuraHandledException('Nenhum status de tarefa concluída está configurado.');
        }

        try {
            update as user new Task(Id = taskId, Status = closedStatuses[0].ApiName);
        } catch (DmlException error) {
            throw new AuraHandledException(
                'Não foi possível concluir a tarefa. Verifique suas permissões e regras da organização.'
            );
        }
    }
}
