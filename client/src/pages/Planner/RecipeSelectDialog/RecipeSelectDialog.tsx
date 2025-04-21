import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import { useRecipeSelectDialog } from './useRecipeSelectDialog';
import './RecipeSelectDialog.css';
import { useState } from 'react';
import { FaUtensils } from 'react-icons/fa'; // Import the React icon
import RecipeGrid from '../../../components/RecipeGrid/RecipeGrid';

interface RecipeSelectDialogProps {
  visible: boolean;
  onHide: () => void;
  onSelect: (recipe: { id: number; name: string }) => void;
}

const RecipeSelectDialog = ({ visible, onHide, onSelect }: RecipeSelectDialogProps) => {
  const { recipes, search, setSearch, loading } = useRecipeSelectDialog(visible);

  const [first, setFirst] = useState(0);
  const rows = 8;

  const header = (
    <div className="recipe-dialog-header">
      <InputText
        value={search}
        onChange={(e) => {
          setFirst(0); // Reset to first page on new search
          setSearch(e.target.value);
        }}
        placeholder="Rezept suchen..."
        className="recipe-dialog-search"
      />
    </div>
  );

  const paginated = recipes.slice(first, first + rows);

  return (
    <Dialog
      visible={visible}
      style={{ width: '80vw', maxWidth: '960px', maxHeight: '90vh' }}
      onHide={onHide}
      className="recipe-select-dialog"
      draggable={false}
      closable
      modal
    >
      <div className="dialog-title">
        <FaUtensils className="dialog-title-icon" /> Rezept auswählen
      </div>
      <div className="dialog-content">
        {header}
        {loading ? (
          <p>Lade Rezepte...</p>
        ) : (
          <>
            <RecipeGrid
              recipes={paginated}
              onSelect={(recipe) => {
                onSelect(recipe);
                onHide();
              }}
              compact
              columns={4}
            />
            <Paginator
              first={first}
              rows={rows}
              totalRecords={recipes.length}
              onPageChange={(e) => setFirst(e.first)}
              className="recipe-dialog-paginator"
            />
          </>
        )}
      </div>
    </Dialog>
  );
};

export default RecipeSelectDialog;
