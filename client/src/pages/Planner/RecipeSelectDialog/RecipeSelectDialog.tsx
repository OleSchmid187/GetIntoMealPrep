import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { useRecipeSelectDialog } from './useRecipeSelectDialog';

interface RecipeSelectDialogProps {
  visible: boolean;
  onHide: () => void;
  onSelect: (recipe: { id: number; name: string }) => void;
}

const RecipeSelectDialog = ({ visible, onHide, onSelect }: RecipeSelectDialogProps) => {
  const { recipes, search, setSearch, loading } = useRecipeSelectDialog(visible);

  const header = (
    <div className="flex justify-content-between">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rezept suchen..."
        />
      </span>
    </div>
  );

  return (
    <Dialog
      header="Rezept auswählen"
      visible={visible}
      style={{ width: '50vw' }}
      onHide={onHide}
      closable
      draggable={false}
    >
      <DataTable
        value={recipes}
        paginator
        rows={10}
        loading={loading}
        header={header}
        emptyMessage="Keine Rezepte gefunden."
        selectionMode="single"
        onSelectionChange={(e) => {
          onSelect(e.value);
          onHide();
        }}
      >
        <Column field="name" header="Name" />
      </DataTable>
    </Dialog>
  );
};

export default RecipeSelectDialog;
